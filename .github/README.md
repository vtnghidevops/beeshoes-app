# BeeShoes Three-Tier Application CI/CD Pipelines

This repository contains GitHub Actions workflows for automated CI/CD deployment of the BeeShoes three-tier e-commerce application.

## 🏗️ Architecture Overview

```
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│     Frontend        │   │     Backend         │   │     Database        │
│   (React/Nginx)     │──▶│   (Spring Boot)     │──▶│    (MariaDB)        │
│   beeshoes-frontend │   │   beeshoes-backend  │   │   Managed by Helm   │
│   Port: 80          │   │   Port: 8080        │   │   Port: 3306        │
└─────────────────────┘   └─────────────────────┘   └─────────────────────┘
```

## 📋 Workflows Overview

### Frontend Workflows

- **`frontend-dev.yml`** - Development environment deployment
- **`frontend-staging.yml`** - Staging environment deployment
- **`frontend-prod.yml`** - Production environment deployment

### Backend Workflows

- **`backend-dev.yml`** - Development environment deployment
- **`backend-staging.yml`** - Staging environment deployment
- **`backend-prod.yml`** - Production environment deployment

## 🚀 Trigger Logic

### Development Environment

- **Trigger**: Merged Pull Requests + Tag pushes
- **Approval**: Automatic (no manual approval required)
- **Branches**: `develop`
- **Tags**: `*-dev-*`, `frontend-*`, `backend-*`

### Staging Environment

- **Trigger**: Tag pushes + Manual dispatch
- **Approval**: **Manual approval required** via GitHub Environment Protection
- **Tags**: `*-staging-*`, `release-staging-*`

### Production Environment

- **Trigger**: Tag pushes + Manual dispatch
- **Approval**: **Manual approval required** via GitHub Environment Protection
- **Tags**: `*-prod-*`, `release-prod-*`, `v*`
- **Safety**: Requires confirmation input for manual deployments

## 🌍 Environments

| Environment     | Namespace          | URL                                   | Replicas | Auto-scaling      |
| --------------- | ------------------ | ------------------------------------- | -------- | ----------------- |
| **Development** | `beeshoes-dev`     | https://beeshoes-dev.deploy.io.vn     | 2        | Enabled (max: 10) |
| **Staging**     | `beeshoes-staging` | https://beeshoes-staging.deploy.io.vn | 3        | Enabled (max: 10) |
| **Production**  | `beeshoes-prod`    | https://beeshoes.deploy.io.vn         | 5        | Enabled (max: 20) |

## 🔧 Technology Stack

### Frontend (React Application)

- **Runtime**: Node.js 22.16.0
- **Package Manager**: Yarn
- **Build Tool**: React Scripts
- **Web Server**: Nginx (Alpine)
- **Container**: Multi-stage Docker build

### Backend (Spring Boot API)

- **Runtime**: Eclipse Temurin JRE 17
- **Build Tool**: Maven 3.9.9
- **Framework**: Spring Boot
- **Database**: MariaDB 11.4.7
- **Container**: Multi-stage Docker build

### Infrastructure

- **Container Registry**: Harbor (harbor.deploy.io.vn)
- **Orchestration**: Kubernetes
- **Package Manager**: Helm 3.14.0
- **Ingress**: Nginx Ingress Controller

## 📦 Build Process

### Frontend Build Pipeline

1. **Setup**: Node.js 22.16.0 + Yarn caching
2. **Dependencies**: `yarn install --frozen-lockfile`
3. **Testing**: Unit tests with coverage
4. **Security**: `yarn audit` for vulnerabilities
5. **Build**: Production React build with optimization
6. **Docker**: Multi-platform build (amd64/arm64)
7. **Deploy**: Helm deployment to Kubernetes

### Backend Build Pipeline

1. **Setup**: JDK 17 + Maven caching
2. **Validation**: Project validation + dependency resolution
3. **Testing**: Unit tests + Integration tests
4. **Reports**: Test coverage + Security scans
5. **Build**: Maven package with optimizations
6. **Docker**: Multi-platform build (amd64/arm64)
7. **Deploy**: Helm deployment to Kubernetes

## 🔒 Security Features

### Image Security

- Multi-stage Docker builds for minimal attack surface
- Non-root container execution
- Dependency vulnerability scanning
- Image signing and verification

### Deployment Security

- Environment-specific secrets management
- Network policies and pod security contexts
- HTTPS enforcement with TLS termination
- Database connection encryption

### Access Control

- GitHub Environment Protection rules
- Manual approval workflows for staging/production
- Audit logging for all deployments
- Role-based access control (RBAC)

## 📊 Monitoring & Health Checks

### Frontend Monitoring

- HTTP health checks on root path (`/`)
- Performance validation (response time < 3s)
- Static asset availability checks
- Security headers validation

### Backend Monitoring

- Spring Boot Actuator endpoints:
  - `/actuator/health` - Overall application health
  - `/actuator/info` - Application information
  - `/actuator/metrics` - Application metrics
  - `/actuator/health/readiness` - Readiness probe
  - `/actuator/health/liveness` - Liveness probe
  - `/actuator/health/db` - Database connectivity

### Infrastructure Monitoring

- Pod readiness and liveness probes
- Resource usage monitoring
- Horizontal Pod Autoscaler (HPA) metrics
- Database connectivity validation

## 🚦 Deployment Flow Examples

### Development Deployment

```bash
# Automatic on merged PR
git checkout develop
git merge feature/new-feature
git push origin develop

# Or via tag
git tag frontend-dev-v1.2.3
git push origin frontend-dev-v1.2.3
```

### Staging Deployment

```bash
# Create staging tag
git tag frontend-staging-v1.2.3
git push origin frontend-staging-v1.2.3

# Manual approval required in GitHub UI
# Workflow will wait for approval before proceeding
```

### Production Deployment

```bash
# Via semantic version tag
git tag v1.2.3
git push origin v1.2.3

# Or manual dispatch via GitHub UI
# Requires confirmation input "PRODUCTION"
# Manual approval required before deployment
```

## 🔧 Configuration

### Required GitHub Secrets

#### Harbor Registry

- `HARBOR_USERNAME` - Harbor registry username
- `HARBOR_PASSWORD` - Harbor registry password

#### Kubernetes Access

- `KUBE_CONFIG_DEV` - Development cluster kubeconfig
- `KUBE_CONFIG_STAGING` - Staging cluster kubeconfig
- `KUBE_CONFIG_PROD` - Production cluster kubeconfig

#### Database Credentials

- `DB_PASSWORD_DEV` - Development database password
- `DB_PASSWORD_STAGING` - Staging database password
- `DB_PASSWORD_PROD` - Production database password

#### Application Secrets

- `JWT_SECRET_DEV` / `JWT_SECRET_STAGING` / `JWT_SECRET_PROD`
- `CLOUDINARY_NAME_*` / `CLOUDINARY_API_KEY_*` / `CLOUDINARY_API_SECRET_*`
- `MAIL_USERNAME_*` / `MAIL_PASSWORD_*`

### Environment Setup

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed environment configuration instructions.

## 📈 Performance Characteristics

### Build Performance

- **Frontend**: ~3-5 minutes (with cache)
- **Backend**: ~5-8 minutes (with cache)
- **Docker Build**: ~2-4 minutes (with BuildKit cache)
- **Deployment**: ~3-5 minutes (depending on environment)

### Resource Requirements

- **Development**: 2 CPU, 4Gi memory, 10Gi storage
- **Staging**: 3 CPU, 6Gi memory, 20Gi storage
- **Production**: 5 CPU, 10Gi memory, 50Gi storage

## 🐛 Troubleshooting

### Common Issues

**Build Failures**

```bash
# Check workflow logs in GitHub Actions tab
# Common causes:
# - Test failures
# - Dependency vulnerabilities
# - Resource constraints
```

**Deployment Failures**

```bash
# Check Kubernetes pods
kubectl get pods -n beeshoes-{env}
kubectl describe pod <pod-name> -n beeshoes-{env}
kubectl logs <pod-name> -n beeshoes-{env}

# Check Helm deployment
helm status beeshoes-app -n beeshoes-{env}
helm history beeshoes-app -n beeshoes-{env}
```

**Health Check Failures**

```bash
# Port forward for direct testing
kubectl port-forward svc/beeshoes-fe-service 8080:80 -n beeshoes-{env}
kubectl port-forward svc/beeshoes-be-service 8080:8080 -n beeshoes-{env}

# Test endpoints locally
curl http://localhost:8080/
curl http://localhost:8080/actuator/health
```

### Support Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)

## 📚 Additional Documentation

- [Environment Setup Guide](./ENVIRONMENT_SETUP.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Helm Chart Documentation](../helm-chart/beeshoes-app/README.md)

---

**Maintained by the DevOps Team** | **Last Updated**: $(date '+%Y-%m-%d')
