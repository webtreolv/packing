FROM php:8.3-apache

EXPOSE 80

# Habilitar mod_rewrite (por si acaso se usa en un futuro)
RUN a2enmod rewrite

# Copiar TODO el proyecto al contenedor
COPY . /var/www/html/

# Permisos
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

WORKDIR /var/www/html
