CREATE TABLE usuario (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  sexo VARCHAR(20) CHECK (sexo IN ('masculino', 'femenino')),
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE categoria (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL
);
CREATE TABLE publicacion (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL,
  categoria_id INT NOT NULL,
  celular VARCHAR(30),
  facebook VARCHAR(150),
  instagram VARCHAR(150),
  localidad VARCHAR(150),
  tiktok VARCHAR(150),
  descripcion TEXT,
  url_foto1 VARCHAR(200),
  url_foto2 VARCHAR(200),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
  FOREIGN KEY (categoria_id) REFERENCES categoria(id) ON DELETE CASCADE
);
CREATE TABLE visitas (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria_id INT NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (categoria_id) REFERENCES categoria(id) ON DELETE CASCADE,
  UNIQUE (fecha, categoria_id)
);
CREATE TABLE visitas_pagina (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  pagina VARCHAR(50) NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 0,
  UNIQUE (fecha, pagina)
);

INSERT INTO categoria (nombre) VALUES
('albañiles'),
('gasistas'),
('plomeros'),
('electricistas'),
('limpieza'),
('tecnicos de electrodomesticos'),
('ropa'),
('terrenos'),
('casas'),
('alimentos'),
('tecnologia'),
('muebles'),
('vehiculos'),
('abogados'),
('contadores'),
('arquitectos'),
('informaticos'),
('diseñadores'),
('aCasas'),
('aDepartamentos'),
('aLocalesComerciales'),
('aHerramientasyMaquinarias'),
('aVehiculos'),
('deliverys'),
('modistas'),
('artesanos'),
('aOtros'),
('bOtros'),
('cOtros'),
('dOtros'),
('perfumes'),
('gastronomia'),
('estetica'),
('peluqueria'),
('construccion'),
('mecanica'),
('arte'),
('informatica'),
('plomeria'),
('electricidad'),
('eOtros');