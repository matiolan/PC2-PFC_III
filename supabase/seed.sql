-- PFC-18: datos de demostración de Gamarra Conecta.
-- Galerías, negocios, productos y ofertas ficticios para probar todos los roles.
-- Cuentas de demostración (contraseña común: Demo2026!):
--   gestor@gamarraconecta.pe · emprendedor@gamarraconecta.pe
--   trabajador@gamarraconecta.pe · comprador@gamarraconecta.pe

-- Galerías ------------------------------------------------------------------
insert into public.galleries (id, name, slug, address, floors, description) values
 ('a1000000-0000-4000-8000-000000000001', 'Galería Los Telares', 'los-telares', 'Jr. Gamarra 610, La Victoria', 6, 'Confección de damas y caballeros, con talleres en los pisos superiores.'),
 ('a1000000-0000-4000-8000-000000000002', 'Centro Comercial Hilo de Oro', 'hilo-de-oro', 'Jr. Antonio Bazo 880, La Victoria', 8, 'Moda juvenil, jeans y prendas deportivas al por mayor.'),
 ('a1000000-0000-4000-8000-000000000003', 'Galería Aguja Fina', 'aguja-fina', 'Jr. Sebastián Barranca 1450, La Victoria', 5, 'Ropa de niños, uniformes escolares y pijamas.'),
 ('a1000000-0000-4000-8000-000000000004', 'Plaza Tejidos del Sur', 'tejidos-del-sur', 'Av. Aviación 650, La Victoria', 4, 'Telas, hilos, avíos e insumos para confección.'),
 ('a1000000-0000-4000-8000-000000000005', 'Galería Punto Pima', 'punto-pima', 'Jr. Humboldt 1340, La Victoria', 7, 'Polos y prendas de algodón pima para exportación.'),
 ('a1000000-0000-4000-8000-000000000006', 'Centro Textil La Parada', 'centro-textil-la-parada', 'Jr. Italia 1120, La Victoria', 3, 'Ropa de hogar, toallas y sábanas.')
on conflict (id) do nothing;

-- Usuarios de demostración ----------------------------------------------------
create or replace function pg_temp.demo_user(uid uuid, mail text, nombre text, rol text)
returns void language plpgsql as $$
begin
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token)
  values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', mail,
    extensions.crypt('Demo2026!', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', nombre, 'role', rol), now(), now(), '', '', '', '')
  on conflict (id) do nothing;
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), uid, uid::text,
    jsonb_build_object('sub', uid::text, 'email', mail, 'email_verified', true), 'email', now(), now(), now())
  on conflict do nothing;
end;
$$;

select pg_temp.demo_user('b1000000-0000-4000-8000-000000000001', 'gestor@gamarraconecta.pe', 'Rosa Quispe Mamani', 'comprador');
select pg_temp.demo_user('b1000000-0000-4000-8000-000000000002', 'emprendedor@gamarraconecta.pe', 'Luis Mendoza Rojas', 'emprendedor');
select pg_temp.demo_user('b1000000-0000-4000-8000-000000000003', 'trabajador@gamarraconecta.pe', 'Carmen Huamán Torres', 'trabajador');
select pg_temp.demo_user('b1000000-0000-4000-8000-000000000004', 'comprador@gamarraconecta.pe', 'Jorge Salazar Vega', 'comprador');
select pg_temp.demo_user('b1000000-0000-4000-8000-000000000011', 'ana.ccori@demo.gamarraconecta.pe', 'Ana Ccori Paucar', 'emprendedor');
select pg_temp.demo_user('b1000000-0000-4000-8000-000000000012', 'pedro.lazo@demo.gamarraconecta.pe', 'Pedro Lazo Inga', 'emprendedor');
select pg_temp.demo_user('b1000000-0000-4000-8000-000000000013', 'maria.flores@demo.gamarraconecta.pe', 'María Flores Cueva', 'emprendedor');
select pg_temp.demo_user('b1000000-0000-4000-8000-000000000014', 'julio.ramos@demo.gamarraconecta.pe', 'Julio Ramos Chávez', 'emprendedor');
select pg_temp.demo_user('b1000000-0000-4000-8000-000000000015', 'elena.soto@demo.gamarraconecta.pe', 'Elena Soto Pariona', 'emprendedor');
select pg_temp.demo_user('b1000000-0000-4000-8000-000000000016', 'raul.yupanqui@demo.gamarraconecta.pe', 'Raúl Yupanqui Díaz', 'emprendedor');
select pg_temp.demo_user('b1000000-0000-4000-8000-000000000017', 'sonia.apaza@demo.gamarraconecta.pe', 'Sonia Apaza Condori', 'emprendedor');
select pg_temp.demo_user('b1000000-0000-4000-8000-000000000018', 'victor.nunez@demo.gamarraconecta.pe', 'Víctor Núñez Palomino', 'emprendedor');
select pg_temp.demo_user('b1000000-0000-4000-8000-000000000019', 'lucia.tito@demo.gamarraconecta.pe', 'Lucía Tito Huallpa', 'emprendedor');

-- El rol de gestor no se puede elegir al registrarse: lo asigna la asociación.
update public.profiles set role = 'gestor' where id = 'b1000000-0000-4000-8000-000000000001';
update public.profiles set phone = '987100200' where id = 'b1000000-0000-4000-8000-000000000003';

-- Negocios ------------------------------------------------------------------
insert into public.businesses (id, owner_id, name, slug, category, description, location_type, gallery_id, floor, stand, zone, whatsapp, level, created_at) values
 ('c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000011', 'Pima Andina', 'pima-andina', 'Damas', 'Polos y blusas de algodón pima con acabado de exportación.', 'galeria', 'a1000000-0000-4000-8000-000000000005', '3', '312', null, '987111001', 4, now() - interval '40 days'),
 ('c1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000012', 'Denim Lazo', 'denim-lazo', 'Caballeros', 'Jeans y casacas denim con lavados a pedido.', 'galeria', 'a1000000-0000-4000-8000-000000000002', '5', '508', null, '987111002', 4, now() - interval '38 days'),
 ('c1000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000013', 'Pequeños Pasos', 'pequenos-pasos', 'Niños', 'Conjuntos y pijamas para bebés y niños.', 'galeria', 'a1000000-0000-4000-8000-000000000003', '2', '214', null, '987111003', 3, now() - interval '33 days'),
 ('c1000000-0000-4000-8000-000000000004', 'b1000000-0000-4000-8000-000000000014', 'Activa Sport', 'activa-sport', 'Deportivo', 'Buzos, shorts y camisetas deportivas personalizadas.', 'galeria', 'a1000000-0000-4000-8000-000000000002', '6', '611', null, '987111004', 3, now() - interval '30 days'),
 ('c1000000-0000-4000-8000-000000000005', 'b1000000-0000-4000-8000-000000000015', 'Telas Soto', 'telas-soto', 'Telas e insumos', 'Jersey, franela, drill y rib por kilo o por rollo.', 'galeria', 'a1000000-0000-4000-8000-000000000004', '1', '105', null, '987111005', 2, now() - interval '25 days'),
 ('c1000000-0000-4000-8000-000000000006', 'b1000000-0000-4000-8000-000000000016', 'Uniformes Yupanqui', 'uniformes-yupanqui', 'Uniformes', 'Uniformes escolares y corporativos con bordado.', 'galeria', 'a1000000-0000-4000-8000-000000000003', '4', '402', null, '987111006', 2, now() - interval '20 days'),
 ('c1000000-0000-4000-8000-000000000007', 'b1000000-0000-4000-8000-000000000017', 'Hogar Apaza', 'hogar-apaza', 'Ropa de hogar', 'Toallas, sábanas y cubrecamas de algodón.', 'via_publica', null, null, null, 'Jr. Gamarra, cuadra 7', '987111007', 1, now() - interval '12 days'),
 ('c1000000-0000-4000-8000-000000000008', 'b1000000-0000-4000-8000-000000000018', 'Gorras Núñez', 'gorras-nunez', 'Accesorios', 'Gorras, chullos y bufandas al por mayor.', 'via_publica', null, null, null, 'Jr. Antonio Bazo, cuadra 9', '987111008', 0, now() - interval '6 days'),
 ('c1000000-0000-4000-8000-000000000009', 'b1000000-0000-4000-8000-000000000019', 'Blusas Lucía', 'blusas-lucia', 'Damas', 'Blusas y vestidos casuales de temporada.', 'via_publica', null, null, null, 'Jr. Humboldt, cuadra 13', '987111009', 0, now() - interval '3 days'),
 ('c1000000-0000-4000-8000-000000000010', 'b1000000-0000-4000-8000-000000000002', 'Confecciones Mendoza', 'confecciones-mendoza', 'Caballeros', 'Camisas y polos box para caballero, producción propia.', 'galeria', 'a1000000-0000-4000-8000-000000000001', '2', '205', null, '987111010', 1, now() - interval '9 days')
on conflict (id) do nothing;

-- Evidencias aprobadas que respaldan cada nivel (archivos de demostración).
insert into public.formalization_evidence (business_id, level, doc_type, doc_number, file_path, status, reviewer_id, reviewed_at, created_at)
select b.id, l.level, l.doc, l.num, 'demo/' || b.slug || '-' || l.doc || '.pdf', 'aprobada',
       'b1000000-0000-4000-8000-000000000001',
       b.created_at + (l.level * interval '2 days') + interval '20 hours',
       b.created_at + (l.level * interval '2 days')
from public.businesses b
cross join (values (1, 'dni', '45871236'), (2, 'ruc', '10458712361'), (3, 'licencia', 'LF-2026-0481'), (4, 'planilla', 'TR-2026-1177')) as l(level, doc, num)
where l.level <= b.level
on conflict do nothing;

-- Pendientes para que el gestor tenga trabajo en la demo.
insert into public.formalization_evidence (business_id, level, doc_type, doc_number, file_path, created_at) values
 ('c1000000-0000-4000-8000-000000000007', 2, 'ruc', '10412589637', 'demo/hogar-apaza-ruc.pdf', now() - interval '5 hours'),
 ('c1000000-0000-4000-8000-000000000008', 1, 'dni', '41258963', 'demo/gorras-nunez-dni.pdf', now() - interval '2 hours')
on conflict do nothing;

-- Productos -----------------------------------------------------------------
insert into public.products (business_id, name, category, description, price_unit, price_dozen, min_order, image_url) values
 ('c1000000-0000-4000-8000-000000000001', 'Polo cuello redondo pima 30/1', 'Damas', 'Algodón pima peinado, tallas S a XL, 12 colores.', 18, 180, 12, '/productos/polo.svg'),
 ('c1000000-0000-4000-8000-000000000001', 'Blusa manga larga pima', 'Damas', 'Tejido suave con caída, cuello en V.', 26, 270, 12, '/productos/blusa.svg'),
 ('c1000000-0000-4000-8000-000000000001', 'Vestido casual pima', 'Damas', 'Corte recto, ideal para tiendas de moda.', 39, 420, 6, '/productos/vestido.svg'),
 ('c1000000-0000-4000-8000-000000000002', 'Jean clásico stretch', 'Caballeros', 'Denim 12 oz con elastano, tallas 28 a 38.', 45, 480, 12, '/productos/jean.svg'),
 ('c1000000-0000-4000-8000-000000000002', 'Casaca denim', 'Caballeros', 'Lavado piedra, botones metálicos.', 68, 750, 6, '/productos/casaca.svg'),
 ('c1000000-0000-4000-8000-000000000002', 'Camisa denim manga larga', 'Caballeros', 'Denim liviano 6 oz, corte slim.', 38, 400, 12, '/productos/camisa.svg'),
 ('c1000000-0000-4000-8000-000000000003', 'Pijama infantil algodón', 'Niños', 'Conjunto de dos piezas, tallas 2 a 12.', 22, 230, 12, '/productos/pijama.svg'),
 ('c1000000-0000-4000-8000-000000000003', 'Conjunto bebé 3 piezas', 'Niños', 'Body, pantalón y gorrito en algodón orgánico.', 35, 360, 6, '/productos/conjunto.svg'),
 ('c1000000-0000-4000-8000-000000000003', 'Polo estampado niño', 'Niños', 'Estampado al agua, colores vivos.', 12, 120, 12, '/productos/polo.svg'),
 ('c1000000-0000-4000-8000-000000000004', 'Buzo deportivo completo', 'Deportivo', 'Casaca y pantalón en tela french terry.', 55, 600, 6, '/productos/buzo.svg'),
 ('c1000000-0000-4000-8000-000000000004', 'Short dry-fit', 'Deportivo', 'Tela transpirable, ideal para equipos.', 16, 160, 12, '/productos/short.svg'),
 ('c1000000-0000-4000-8000-000000000004', 'Camiseta de fútbol sublimada', 'Deportivo', 'Diseño personalizado con nombre y número.', 24, 252, 12, '/productos/camiseta.svg'),
 ('c1000000-0000-4000-8000-000000000005', 'Tela jersey algodón (kg)', 'Telas e insumos', 'Jersey 30/1 en 40 colores, precio por kilo.', 32, 360, 12, '/productos/tela.svg'),
 ('c1000000-0000-4000-8000-000000000005', 'Rib para cuellos (kg)', 'Telas e insumos', 'Rib 1x1 combinable con jersey.', 34, 380, 12, '/productos/tela.svg'),
 ('c1000000-0000-4000-8000-000000000006', 'Uniforme escolar completo', 'Uniformes', 'Pantalón o falda, camisa y chompa.', 85, 960, 6, '/productos/uniforme.svg'),
 ('c1000000-0000-4000-8000-000000000006', 'Polo corporativo bordado', 'Uniformes', 'Piqué con logo bordado, mínimo 12.', 28, 300, 12, '/productos/polo.svg'),
 ('c1000000-0000-4000-8000-000000000007', 'Toalla de baño 100 % algodón', 'Ropa de hogar', '70 x 140 cm, 500 g/m².', 25, 270, 12, '/productos/toalla.svg'),
 ('c1000000-0000-4000-8000-000000000007', 'Juego de sábanas 2 plazas', 'Ropa de hogar', 'Percal 180 hilos, 4 piezas.', 48, 520, 6, '/productos/sabana.svg'),
 ('c1000000-0000-4000-8000-000000000008', 'Gorra drill bordada', 'Accesorios', 'Seis paneles, cierre regulable.', 9, 90, 12, '/productos/gorra.svg'),
 ('c1000000-0000-4000-8000-000000000008', 'Chullo de lana', 'Accesorios', 'Tejido a máquina con diseño andino.', 11, 115, 12, '/productos/gorra.svg'),
 ('c1000000-0000-4000-8000-000000000009', 'Blusa de gasa estampada', 'Damas', 'Temporada verano, tallas estándar.', 20, 210, 12, '/productos/blusa.svg'),
 ('c1000000-0000-4000-8000-000000000009', 'Vestido floreado', 'Damas', 'Tela viscosa, largo midi.', 32, 340, 6, '/productos/vestido.svg'),
 ('c1000000-0000-4000-8000-000000000010', 'Camisa oxford caballero', 'Caballeros', 'Algodón oxford, manga larga, tallas S a XXL.', 35, 372, 12, '/productos/camisa.svg'),
 ('c1000000-0000-4000-8000-000000000010', 'Polo box fit', 'Caballeros', 'Jersey 24/1 de algodón, corte oversize.', 19, 196, 12, '/productos/polo.svg')
on conflict do nothing;

-- Ofertas de empleo (sueldo ≥ RMV) --------------------------------------------
insert into public.job_offers (id, business_id, title, description, salary, schedule, contract_type, vacancies, created_at) values
 ('d1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'Operaria de remalladora', 'Confección de polos pima en máquina remalladora. Se valora experiencia mínima de un año en prendas de punto.', 1500, 'Lunes a sábado, 8:00 a 17:00', 'Plazo indeterminado', 3, now() - interval '4 days'),
 ('d1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000002', 'Cortador de tela denim', 'Corte de tela denim con máquina vertical siguiendo moldes y tizado. Capacitación en seguridad incluida.', 1650, 'Lunes a sábado, 7:30 a 16:30', 'Plazo fijo', 2, now() - interval '3 days'),
 ('d1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000003', 'Vendedora de stand', 'Atención a clientes mayoristas, manejo de caja y registro de pedidos por WhatsApp.', 1300, 'Lunes a domingo con un día de descanso, 9:00 a 18:00', 'Plazo indeterminado', 1, now() - interval '2 days'),
 ('d1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000004', 'Operario de sublimación', 'Manejo de plancha y calandra de sublimación para camisetas deportivas personalizadas.', 1400, 'Lunes a viernes, 8:00 a 17:00', 'Plazo fijo', 2, now() - interval '1 day'),
 ('d1000000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000006', 'Bordador(a) de uniformes', 'Operación de máquina bordadora computarizada de 6 cabezales para logos corporativos.', 1450, 'Lunes a sábado, 8:00 a 17:00', 'Plazo indeterminado', 1, now() - interval '20 hours'),
 ('d1000000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000005', 'Despachador de almacén (medio tiempo)', 'Pesado, empaque y despacho de rollos de tela a clientes. Turno mañana.', 700, 'Lunes a sábado, 7:00 a 11:00', 'Tiempo parcial', 1, now() - interval '10 hours')
on conflict (id) do nothing;

insert into public.applications (offer_id, worker_id, message, status) values
 ('d1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000003', 'Tengo dos años de experiencia en remalladora y recta en talleres de Gamarra.', 'en_revision')
on conflict do nothing;
