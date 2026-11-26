# 🏢 CMS CANACO

Sistema de Gestión de Contenidos (CMS) desarrollado en **Django** para la administración de noticias, categorías, comentarios y usuarios de CANACO. Diseñado con una interfaz responsiva y desplegado en servidores Linux (Ubuntu) con Nginx, Gunicorn y MySQL/MariaDB.

---

## ✨ Características Principales

* **Gestión de Contenidos (CRUD):** Administración completa de noticias, categorías, comentarios y usuarios con operaciones asíncronas (AJAX).
* **Control de Acceso Basado en Roles:** Gestión de usuarios restringida a perfiles de administrador.
* **Interfaz Responsiva:** Diseño adaptable con Bootstrap, barra lateral dinámica, carrusel de noticias, sección de contacto y aviso de cookies.
* **Base de Datos Relacional:** Integración optimizada con MySQL/MariaDB.

---

## 🛠️ Tecnologías y Requerimientos de Software

| Componente | Versión / Tecnología |
| :--- | :--- |
| **Lenguaje** | Python `3.14.7` |
| **Framework Backend** | Django `5.2` |
| **Base de Datos** | MySQL / MariaDB `11.4.9` |
| **Conectores Python** | `django-mysql==4.19.0`, `mysqlclient==2.2.8` |
| **Servidor Web / Proxy Inverso** | Nginx |
| **Servidor de Aplicaciones WSGI** | Gunicorn |
| **Frontend** | HTML5, CSS3, JavaScript, Bootstrap |

---

## 📋 Requerimientos Adicionales para Alojar en Ubuntu Server

Además de las dependencias base de Python y MySQL, para hostear este proyecto en producción en un servidor Ubuntu (como una máquina virtual en Microsoft Azure) necesitarás:

1. **Servidor WSGI (Gunicorn):** Django no debe ejecutarse con `runserver` en producción. Gunicorn actúa como puente entre Nginx y la aplicación Django, gestionado como un servicio de `systemd`.
2. **Reglas de Firewall (UFW y Cloud NSG):**
   * Puerto **22** (SSH) para administración remota.
   * Puerto **80** (HTTP) y **443** (HTTPS) para tráfico web.
   * Puerto **3306** (MySQL) *solo si necesitas conectarte desde clientes externos como Navicat, HeidiSQL o MySQL Workbench*.
3. **Configuración de Seguridad en Django (`settings.py`):**
   * `DEBUG = False` en producción.
   * `ALLOWED_HOSTS` configurado con la IP pública o dominio del servidor.
   * `CSRF_TRUSTED_ORIGINS` configurado con el esquema `http://` o `https://` y el dominio/IP correspondiente.
   * Recolección de archivos estáticos (`STATIC_ROOT`) servidos directamente por Nginx.
4. **Certificado SSL (Recomendado):** Uso de **Certbot (Let's Encrypt)** para habilitar HTTPS en el dominio.

---

## 🚀 Guía de Despliegue en Servidor Ubuntu

### 1. Actualización del sistema e instalación de dependencias base

```bash
sudo apt update && sudo apt upgrade -y

# Instalación de Python y herramientas de entorno virtual
sudo apt install python3-pip python3-venv python3-dev -y

# Instalación de librerías de desarrollo para MySQL
sudo apt install default-libmysqlclient-dev build-essential pkg-config -y

# Instalación del servidor web Nginx
sudo apt install nginx -y

```

### 2. Instalación y configuración de MySQL

```bash
# Instalar MySQL Server
sudo apt install mysql-server -y

# Iniciar y habilitar el servicio
sudo systemctl start mysql
sudo systemctl enable mysql

# Ejecutar script de seguridad inicial
sudo mysql_secure_installation

```

> **Nota para conexión remota (Navicat, HeidiSQL, MySQL Workbench):**
> Si deseas administrar la base de datos de forma remota:
> 1. Abre el puerto `3306` en el grupo de seguridad de red (NSG) de tu VM en Azure y en el firewall `ufw`.
> 2. Edita el archivo de configuración de MySQL (`/etc/mysql/mysql.conf.d/mysqld.cnf` o `my.cnf`) y cambia `bind-address = 127.0.0.1` por `bind-address = 0.0.0.0`.
> 3. Reinicia el servicio con `sudo systemctl restart mysql`.
> 
> 

### 3. Clonación del repositorio y entorno virtual

```bash
# Clonar el proyecto
git clone [https://github.com/dev-cocarlos/cms_canaco.git](https://github.com/dev-cocarlos/cms_canaco.git)
cd cms_canaco

# Crear y activar el entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias del proyecto y Gunicorn
pip install -r requirements.txt
pip install gunicorn

```

### 4. Migraciones y archivos estáticos

```bash
# Aplicar migraciones a la base de datos
python manage.py migrate

# Recolectar archivos estáticos para Nginx
python manage.py collectstatic --noinput

```

### 5. Configuración del servicio Gunicorn (`systemd`)

Crea el archivo `/etc/systemd/system/gunicorn.service`:

```ini
[Unit]
Description=Gunicorn daemon para CMS CANACO
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/ruta/a/tu/proyecto/cms_canaco
ExecStart=/ruta/a/tu/proyecto/cms_canaco/venv/bin/gunicorn --access-logfile - --workers 3 --bind unix:/run/gunicorn.sock nombre_proyecto.wsgi:application

[Install]
WantedBy=multi-user.target

```

Habilita e inicia el servicio:

```bash
sudo systemctl daemon-reload
sudo systemctl start gunicorn
sudo systemctl enable gunicorn

```

### 6. Configuración de Nginx como Proxy Inverso

Crea el archivo de configuración en `/etc/nginx/sites-available/cms_canaco`:

```nginx
server {
    listen 80;
    server_name tu_dominio_o_ip;

    # Aumentar límite de subida de archivos (evita error 413)
    client_max_body_size 20M;

    location = /favicon.ico { access_log off; log_not_found off; }

    location /static/ {
        root /ruta/a/tu/proyecto/cms_canaco;
    }

    location /media/ {
        root /ruta/a/tu/proyecto/cms_canaco;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn.sock;
    }
}

```

Activa el sitio y reinicia Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/cms_canaco /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx

```

---

## 👨‍💻 Autor

* **Carlos Coronel Hernández** - [@dev-cocarlos](https://www.google.com/search?q=https://github.com/dev-cocarlos)

```

---

### Detalles que puedes personalizar antes de subirlo
* **`/ruta/a/tu/proyecto/cms_canaco`:** Reemplázalo por la ruta real en tu servidor Ubuntu (por ejemplo, `/home/ubuntu/cms_canaco` o `/var/www/cms_canaco`).
* **`nombre_proyecto.wsgi:application`:** Cambia `nombre_proyecto` por el nombre exacto de la carpeta donde reside tu archivo `wsgi.py` (por ejemplo, `canaco.wsgi:application`).
* **`User=ubuntu`:** Ajústalo si tu usuario de Linux en la máquina virtual tiene otro nombre.
```
