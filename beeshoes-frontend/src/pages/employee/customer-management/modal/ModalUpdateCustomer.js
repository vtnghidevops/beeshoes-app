import React, { useEffect, useState } from "react";
import {
  Modal,
  Input,
  Select,
  Button,
  Form,
  Row,
  Col,
  Upload,
  Radio,
} from "antd";
import moment from "moment";
import { useAppDispatch } from "../../../../app/hook";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CustomerApi } from "../../../../api/employee/account/customer.api";
import { UpdateCustomer } from "../../../../app/reducer/Customer.reducer";
import { useParams, useNavigate } from "react-router-dom";
import "../style-customer.css";
import { PlusOutlined } from "@ant-design/icons";
import { AddressApi } from "../../../../api/customer/address/address.api";
import axios from "axios";
const { Option } = Select;

const ModalUpdateCustomer = ({ visible }) => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [formAddres] = Form.useForm();
  const [customer, setCustomer] = useState({});
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [listProvince, setListProvince] = useState([]);
  const [listDistricts, setListDistricts] = useState([]);
  const [listWard, setListWard] = useState([]);

  // ảnh
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const handleCancelImagel = () => setPreviewOpen(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
  };

  const handleChange = ({ file }) => {
    if (file.status === "removed") {
      // If the file is being uploaded or removed, set the uploadedFile state accordingly
      setUploadedFile(null);
    } else if (file.type !== "image/jpeg" && file.type !== "image/png") {
      // If the file is not a JPG or PNG image, display an error message
      toast.error("Bạn chỉ có thể tải lên tệp JPG/PNG!");
      return;
    } else {
      setUploadedFile(file);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </div>
  );

  const loadDataProvince = () => {
    AddressApi.fetchAllProvince().then(
      (res) => {
        setListProvince(res.data.data);
      },
      (err) => {
        console.log(err);
      }
    );
  };

  const handleProvinceChange = (value, valueProvince) => {
    form.setFieldsValue({ provinceId: valueProvince.valueProvince });
    AddressApi.fetchAllProvinceDistricts(valueProvince.valueProvince).then(
      (res) => {
        setListDistricts(res.data.data);
      }
    );
  };

  const handleDistrictChange = (value, valueDistrict) => {
    form.setFieldsValue({ toDistrictId: valueDistrict.valueDistrict });
    AddressApi.fetchAllProvinceWard(valueDistrict.valueDistrict).then((res) => {
      setListWard(res.data.data);
    });
  };
  const handleWardChange = (value, valueWard) => {
    form.setFieldsValue({ wardCode: valueWard.valueWard });
  };

  const getOneAddress = () => {
    if (id != null && id !== "") {
      AddressApi.getOne(id).then((res) => {
        setCustomer(res.data.data);
        form.setFieldsValue({
          ...res.data.data,
          dateOfBirth: moment(res.data.data.dateOfBirth).format("YYYY-MM-DD"),
        });
      });
    }
  };
  const getOne = () => {
    if (id != null && id !== "") {
      console.log(id);
      CustomerApi.getOne(id).then((res) => {
        AddressApi.getAddressByUserIdAndStatus(id).then((resAddress) => {
          const addressData = resAddress.data.data;
          setCustomer(res.data.data);
          const formValues = {
            ...res.data.data,
            dateOfBirth: moment(res.data.data.dateOfBirth).format("DD/MM/YYYY"),
          };

          if (addressData) {
            formValues.province = addressData.province;
            formValues.district = addressData.district;
            formValues.ward = addressData.ward;
            formValues.line = addressData.line;
            formValues.toDistrictId = addressData.toDistrictId;
            formValues.provinceId = addressData.provinceId;
            formValues.wardCode = addressData.wardCode;
          }

          form.setFieldsValue(formValues);
          if (resAddress.data.data?.toDistrictId) {
            AddressApi.fetchAllProvinceWard(
              resAddress.data.data.toDistrictId
            ).then((resWard) => {
              setListWard(resWard.data.data);
            });
            AddressApi.fetchAllProvinceDistricts(
              resAddress.data.data.provinceId
            ).then((resDistrict) => {
              setListDistricts(resDistrict.data.data);
            });
          }
        });

        if (res.data.data?.avata) {
          setUploadedFile({
            url: res.data.data.avata,
            uid: "-1",
            name: "avatar.png", // Đặt tên mặc định cho ảnh avatar
            status: "done",
          });
        }
      });
    }
  };

  useEffect(() => {
    if (id != null && id !== "") {
      getOne();
    }
    form.resetFields();
    return () => {
      setCustomer({});
    };
  }, [id, visible]);

  useEffect(() => {
    loadDataProvince();
  }, []);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        return new Promise((resolve, reject) => {
          Modal.confirm({
            title: "Xác nhận",
            content: "Bạn có đồng ý cập nhật không?",
            okText: "Đồng ý",
            cancelText: "Hủy",
            onOk: () => resolve(values),
            onCancel: () => reject(),
          });
        });
      })
      .then((values) => {
        const formattedDate = moment(
          values.dateOfBirth,
          "YYYY-MM-DD"
        ).valueOf();
        const updatedValues = { ...values, dateOfBirth: formattedDate };
        if (uploadedFile == null) {
          toast.error("Bạn cần thêm ảnh đai diện ");
        } else {
          console.log(updatedValues);
          console.log(uploadedFile);
          const formData = new FormData();

          const promises = () => {
            return new Promise((resolve, reject) => {
              if (uploadedFile.originFileObj) {
                formData.append(`multipartFile`, uploadedFile.originFileObj);
                resolve(); // Resolve the promise immediately if there is originFileObj
              } else if (uploadedFile.url) {
                axios
                  .get(uploadedFile.url, { responseType: "arraybuffer" })
                  .then((response) => {
                    const imageFile = new File(
                      [response.data],
                      "your_image_public_id.jpg",
                      { type: "image/jpeg" }
                    );
                    formData.append(`multipartFile`, imageFile);
                    resolve(); // Resolve the promise after adding the imageFile to formData
                  })
                  .catch((error) => {
                    console.error("Error fetching image:", error);
                    reject(error); // Reject the promise if there is an error
                  });
              } else {
                resolve(); // Resolve the promise immediately if there is neither originFileObj nor url
              }
            });
          };

          promises() // Call the 'promises' function to execute the file conversion promise
            .then(() => {
              formData.append(`request`, JSON.stringify(updatedValues));
              console.log(id);
              CustomerApi.update(id, formData)
                .then((res) => {
                  dispatch(UpdateCustomer(res.data.data));
                  toast.success("Cập nhật thành công");
                  navigate("/customer-management");
                })
                .catch((error) => {
                  toast.error(error.response.data.message);
                  console.log("Update failed:", error);
                });
            })
            .catch((error) => {
              console.error("Error converting and appending file:", error);
            });
        }
      })
      .catch(() => {
        // Xử lý khi người dùng từ chối xác nhận
      });
  };

  const handleCancel = () => {
    navigate("/customer-management");
  };
  const validateAge = (rule, value) => {
    if (value) {
      const currentDate = new Date();
      const selectedDate = new Date(value);
      const ageDifference =
        currentDate.getFullYear() - selectedDate.getFullYear();

      if (ageDifference < 18) {
        return Promise.reject("Phải đủ 18 tuổi trở lên");
      }
    }
    return Promise.resolve();
  };
  return (
    <div>
      <div
        className="content-wrapper"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: "25px",
            fontWeight: "bold",
            marginTop: "10px",
            marginBottom: "20px",
          }}
        >
          CẬP NHẬT KHÁCH HÀNG
        </span>
      </div>
      <Row gutter={[24, 8]}>
        <Col
          className="filter"
          span={6}
          style={
            {
              // display: "flex",
              // flexDirection: "column",
              // alignItems: "center",
            }
          }
        >
          <div>
            <h1
              style={{
                // display: "flex",
                // alignItems: "center",
                // justifyContent: "center",
                marginTop: "50px",
                marginBottom: "50px",
                fontSize: "20px",
                marginLeft: "31%",
              }}
            >
              Ảnh đại diện
            </h1>
            {/* ... */}
            <Row>
              <Col span={1}></Col>
              <Col span={12}>
                <div style={{ marginLeft: "20%" }}>
                  <Upload
                    listType="picture-circle"
                    fileList={uploadedFile ? [uploadedFile] : []}
                    onPreview={handlePreview}
                    onChange={handleChange}
                    onRemove={() => setUploadedFile(null)}
                    customRequest={({ file, onSuccess }) => {
                      onSuccess(file);
                    }}
                    showUploadList={{
                      showPreviewIcon: true,
                      showRemoveIcon: true,
                      showErrorTips: true,
                    }}
                  >
                    {uploadedFile ? null : uploadButton}
                  </Upload>
                  <Modal
                    open={previewOpen}
                    title={previewTitle}
                    footer={null}
                    onCancel={handleCancelImagel}
                  >
                    <img
                      alt="example"
                      style={{
                        width: "100%",
                      }}
                      src={previewImage}
                    />
                  </Modal>
                </div>
              </Col>
            </Row>
            {/* ... */}
          </div>
        </Col>

        <Col className="filter" span={17} style={{ marginLeft: "20px" }}>
          {/* <div className="filter"> */}
          <h1
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "15px",
              marginBottom: "30px",
              fontSize: "20px",
            }}
          >
            Thông tin khách hàng
          </h1>
          <Form form={form} layout="vertical">
            <Row gutter={[24, 8]}>
              <Col span={10} style={{ marginLeft: "6%" }}>
                <div className="title_add">
                  <Form.Item
                    label="Tên khách hàng"
                    name="fullName"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên" },
                      {
                        validator: (_, value) => {
                          if (value && value[0] === " ") {
                            return Promise.reject(
                              "Tên không được nhập khoảng trắng"
                            );
                          }
                          if (value.length > 50) {
                            return Promise.reject(
                              "Tên khách hàng tối đa 50 ký tự"
                            );
                          }
                          if (/\d/.test(value)) {
                            return Promise.reject("Tên không được chứa số");
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input
                      className="input-item"
                      placeholder="Tên khách hàng"
                    />
                  </Form.Item>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email" },
                      { max: 50, message: "Email tối đa 50 ký tự" },
                      {
                        pattern:
                          /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                        message: "Email không đúng định dạng",
                      },
                    ]}
                  >
                    <Input className="input-item" placeholder="Email" />
                  </Form.Item>
                  <Form.Item
                    label="Tỉnh/Thành phố"
                    name="province"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn Tỉnh/Thành phố",
                      },
                    ]}
                  >
                    <Select onChange={handleProvinceChange}>
                      {/* <Option value="">--Chọn Tỉnh/Thành phố--</Option> */}
                      {listProvince?.map((item) => {
                        return (
                          <Option
                            key={item.ProvinceID}
                            value={item.ProvinceName}
                            valueProvince={item.ProvinceID}
                          >
                            {item.ProvinceName}
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Xã/Phường"
                    name="ward"
                    rules={[
                      { required: true, message: "Vui lòng chọn Xã/Phường" },
                    ]}
                  >
                    <Select onChange={handleWardChange}>
                      {/* <Option value="">--Chọn Xã/Phường--</Option> */}
                      {listWard?.map((item) => {
                        return (
                          <Option
                            key={item.WardCode}
                            value={item.WardName}
                            valueWard={item.WardCode}
                          >
                            {item.WardName}
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label="Trạng thái"
                    name="status"
                    // initialValue="DANG_SU_DUNG"
                    rules={[
                      { required: true, message: "Vui lòng chọn trạng thái" },
                    ]}
                  >
                    <Select>
                      <Option value="DANG_SU_DUNG">
                        <span style={{ fontWeight: "bold" }}>Kích hoạt</span>
                      </Option>
                      <Option value="KHONG_SU_DUNG">
                        <span style={{ fontWeight: "bold" }}>
                          Ngừng kích hoạt
                        </span>
                      </Option>
                    </Select>
                  </Form.Item>
                </div>
              </Col>

              <Col span={10} style={{ marginLeft: "40px", marginTop: "16px" }}>
                <Form.Item
                  label="Số điện thoại"
                  name="phoneNumber"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập số điện thoại",
                    },
                    {
                      pattern: /^0\d{9}$/,
                      message:
                        "Số điện thoại phải bắt đầu từ số 0 và gồm 10 chữ số",
                    },
                  ]}
                >
                  <Input className="input-item" placeholder="Số điện thoại" />
                </Form.Item>
                <Form.Item
                  label="Ngày sinh"
                  name="dateOfBirth"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày sinh" },
                    { validator: validateAge },
                  ]}
                >
                  <Input className="input-item" type="date" />
                </Form.Item>
                <Form.Item
                  label="Quận/Huyện"
                  name="district"
                  rules={[
                    { required: true, message: "Vui lòng chọn Quận/Huyện" },
                  ]}
                >
                  <Select onChange={handleDistrictChange}>
                    {/* <Option value={}>--Chọn Quận/Huyện--</Option> */}
                    {listDistricts?.map((item) => {
                      return (
                        <Option
                          key={item.DistrictID}
                          value={item.DistrictName}
                          valueDistrict={item.DistrictID}
                        >
                          {item.DistrictName}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Số nhà/Ngõ/Đường"
                  name="line"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập số nhà/ngõ/đường",
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Số nhà/Ngõ/Đường"
                  />
                </Form.Item>
                <Form.Item
                  label="Giới tính"
                  name="gender"
                  rules={[
                    { required: true, message: "Vui lòng chọn giới tinh" },
                  ]}
                  initialValue={customer.gender === true ? "Nam" : "Nữ"}
                >
                  <Radio.Group>
                    <Radio value={true}>Nam</Radio>
                    <Radio value={false}>Nữ</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item name="toDistrictId" hidden>
                  <Input disabled />
                </Form.Item>
                <Form.Item name="provinceId" hidden>
                  <Input disabled />
                </Form.Item>
                <Form.Item name="wardCode" hidden>
                  <Input disabled />
                </Form.Item>
                {/* <div>
                  <QrReader
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    style={{ width: "100%" }}
                  />
                  <p>Scanned Data: {qrData}</p>
                </div> */}
              </Col>
            </Row>
          </Form>
          {/* </div> */}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "15px",
              marginRight: "8%",
              marginBottom: "20px",
            }}
          >
            <Button
              key="submit"
              type="primary"
              onClick={handleOk}
              style={{ marginRight: "10px", width: "100px", height: "40px" }}
            >
              Cập nhật
            </Button>
            <Button
              key="cancel"
              onClick={handleCancel}
              style={{ width: "100px", height: "40px" }}
            >
              Hủy
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};
export default ModalUpdateCustomer;
