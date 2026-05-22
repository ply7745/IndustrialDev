# 🚀 劳务公司员工信息管理系统 - 快速部署

## 一分钟快速启动

### 方式一：一键部署脚本（推荐）

```bash
# 克隆项目
cd workspace

# 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 方式二：Docker Compose 直接启动

#### 使用 SQLite（最简单）

```bash
docker-compose up -d --build
```

#### 使用 MySQL

```bash
docker-compose -f docker-compose.mysql.yml up -d --build
```

#### 使用 PostgreSQL

```bash
docker-compose -f docker-compose.postgres.yml up -d --build
```

---

## 部署后访问

- **前端应用**：http://localhost
- **API 服务**：http://localhost/api

---

## 常用管理命令

```bash
# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f labor-management

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 更新部署
git pull
docker-compose up -d --build
```

---

## 数据库选择指南

| 数据库 | 适用场景 | 优点 | 缺点 |
|--------|----------|------|------|
| **SQLite** | 测试、小型生产 | 无需额外服务，配置简单 | 高并发性能有限 |
| **MySQL** | 中型生产 | 成熟稳定，性能好 | 需要管理数据库服务 |
| **PostgreSQL** | 大型生产 | 功能强大，扩展性好 | 资源消耗较大 |

---

## 生产环境建议

1. **修改默认密码**
   - 修改数据库密码
   - 配置安全的环境变量

2. **启用 HTTPS**
   - 使用 Let's Encrypt 免费证书
   - 配置 Nginx SSL

3. **数据备份**
   - 定期备份数据库
   - 重要数据异地备份

4. **监控告警**
   - 配置服务健康检查
   - 设置日志和性能监控

---

## 故障排查

### 服务无法启动

```bash
# 查看详细日志
docker-compose logs labor-management
```

### 端口被占用

修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "8080:80"  # 将主机端口改为 8080
```

### 数据持久化

所有数据存储在 Docker volumes 中，删除容器不会丢失数据。

---

## 更多文档

- [完整部署指南](./docs/部署指南.md)
- [系统设计文档](./docs/labor-management-system-design.md)
- [使用说明](./docs/员工信息管理系统使用说明.md)

---

## 技术支持

如有问题，请查看项目文档或联系技术支持团队。
