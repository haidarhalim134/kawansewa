-- =====================================================
-- DUMMY DATA SQL FOR KAWANSEWA DATABASE
-- Camera Rental Platform
-- =====================================================

-- Note: Password hash is for "password123" using bcrypt
-- You can generate it using: bcrypt.hash("password123", 10)

-- =====================================================
-- 1. INSERT USERS
-- =====================================================

INSERT INTO users (email, password_hash, name, location, profile_image_url) VALUES
-- Owner/Renter Users
('john.photographer@gmail.com', '$2a$12$zg/bRZ1s7f23tJ82S8Ig8uQyiBoApZfoQUEIR9Fz/GHkyGgbfl/vO', 'John Anderson', 'Telkom University Bandung', 'https://i.pravatar.cc/150?img=12'),
('sarah.creative@gmail.com', '$2a$12$zg/bRZ1s7f23tJ82S8Ig8uQyiBoApZfoQUEIR9Fz/GHkyGgbfl/vO', 'Sarah Williams', 'Telkom University Bandung', 'https://i.pravatar.cc/150?img=45'),
('mike.studios@gmail.com', '$2a$12$zg/bRZ1s7f23tJ82S8Ig8uQyiBoApZfoQUEIR9Fz/GHkyGgbfl/vO', 'Michael Chen', 'Telkom University Bandung', 'https://i.pravatar.cc/150?img=33'),
('lisa.captures@gmail.com', '$2a$12$zg/bRZ1s7f23tJ82S8Ig8uQyiBoApZfoQUEIR9Fz/GHkyGgbfl/vO', 'Lisa Martinez', 'Telkom University Bandung', 'https://i.pravatar.cc/150?img=47'),
('david.lens@gmail.com', '$2a$12$zg/bRZ1s7f23tJ82S8Ig8uQyiBoApZfoQUEIR9Fz/GHkyGgbfl/vO', 'David Kumar', 'Telkom University Bandung', 'https://i.pravatar.cc/150?img=15'),
('emma.photo@gmail.com', '$2a$12$zg/bRZ1s7f23tJ82S8Ig8uQyiBoApZfoQUEIR9Fz/GHkyGgbfl/vO', 'Emma Rodriguez', 'Telkom University Bandung', 'https://i.pravatar.cc/150?img=23'),
('alex.visual@gmail.com', '$2a$12$zg/bRZ1s7f23tJ82S8Ig8uQyiBoApZfoQUEIR9Fz/GHkyGgbfl/vO', 'Alex Thompson', 'Telkom University Bandung', 'https://i.pravatar.cc/150?img=52'),
('nina.imagery@gmail.com', '$2a$12$zg/bRZ1s7f23tJ82S8Ig8uQyiBoApZfoQUEIR9Fz/GHkyGgbfl/vO', 'Nina Patel', 'Telkom University Bandung', 'https://i.pravatar.cc/150?img=28'),
('ryan.shots@gmail.com', '$2a$12$zg/bRZ1s7f23tJ82S8Ig8uQyiBoApZfoQUEIR9Fz/GHkyGgbfl/vO', 'Ryan Mitchell', 'Telkom University Bandung', 'https://i.pravatar.cc/150?img=67'),
('olivia.frame@gmail.com', '$2a$12$zg/bRZ1s7f23tJ82S8Ig8uQyiBoApZfoQUEIR9Fz/GHkyGgbfl/vO', 'Olivia Zhang', 'Telkom University Bandung', 'https://i.pravatar.cc/150?img=31');

-- =====================================================
-- 2. INSERT CAMERA ITEMS
-- =====================================================

INSERT INTO items (owner_id, name, detail, price_per_day) VALUES
-- Canon Cameras
(1, 'Canon EOS R5', 'Professional mirrorless camera with 45MP sensor, 8K video recording, dual card slots. Perfect for weddings and commercial photography. Includes battery and charger.', 500000),
(1, 'Canon EOS 5D Mark IV', 'Full-frame DSLR camera with 30.4MP, 4K video, excellent low-light performance. Great for portraits and events. Battery and charger included.', 350000),
(2, 'Canon EOS R6', 'High-performance mirrorless camera with 20MP, excellent autofocus, 4K 60fps video. Ideal for sports and wildlife. Complete with battery grip.', 450000),

-- Sony Cameras
(2, 'Sony A7 IV', 'Versatile full-frame mirrorless camera with 33MP, 4K 60p video, advanced autofocus. Perfect for hybrid shooters. Includes 2 batteries.', 480000),
(3, 'Sony A7S III', 'Low-light specialist with 12MP, exceptional 4K 120fps video, professional codec support. Cinema-grade performance. Battery and accessories included.', 550000),
(3, 'Sony A7R V', 'High-resolution powerhouse with 61MP, AI-powered autofocus, 8K video. Ultimate detail capture. Comes with vertical grip.', 600000),

-- Nikon Cameras
(4, 'Nikon Z9', 'Flagship mirrorless camera with 45.7MP stacked sensor, 8K video, no blackout viewfinder. Professional grade. Complete kit with CFexpress cards.', 650000),
(4, 'Nikon Z6 II', 'Dual-processor full-frame camera with 24.5MP, 4K video, excellent low-light. Balanced performance. Includes battery and charger.', 400000),
(5, 'Nikon D850', 'Professional DSLR with 45.7MP, robust build, excellent dynamic range. Landscape and studio favorite. Battery grip included.', 420000),

-- Fujifilm Cameras
(5, 'Fujifilm X-T5', 'APS-C mirrorless with 40MP, film simulations, 6.2K video. Retro design meets modern tech. Comes with 2 batteries.', 380000),
(6, 'Fujifilm GFX 100S', 'Medium format mirrorless with 102MP, incredible detail, compact design. Commercial photography beast. Professional kit included.', 750000),

-- Lenses
(6, 'Canon RF 24-70mm f/2.8L IS USM', 'Professional standard zoom lens with image stabilization, weather sealing. Versatile for all scenarios. Lens hood and caps included.', 250000),
(7, 'Canon RF 70-200mm f/2.8L IS USM', 'Telephoto zoom lens perfect for sports, wildlife, portraits. Fast and sharp. Complete with tripod collar.', 300000),
(7, 'Sony FE 24-70mm f/2.8 GM II', 'Professional standard zoom with exceptional sharpness, fast autofocus. Industry-leading optics. Protective case included.', 280000),
(8, 'Sony FE 70-200mm f/2.8 GM OSS II', 'Flagship telephoto zoom with optical stabilization, beautiful bokeh. Professional favorite. Lens case and hood included.', 320000),
(8, 'Nikon Z 24-70mm f/2.8 S', 'Premium standard zoom for Z-mount, superb image quality, weather sealed. All-purpose workhorse.', 270000),

-- Specialty Lenses
(9, 'Canon RF 85mm f/1.2L USM', 'Premium portrait lens with ultra-wide aperture, dreamy bokeh. Studio essential. Mint condition with all accessories.', 200000),
(9, 'Sony FE 85mm f/1.4 GM', 'Professional portrait lens with beautiful rendering, fast autofocus. Perfect for professional portraits.', 180000),
(10, 'Fujifilm XF 56mm f/1.2 R APD', 'Classic portrait lens with apodization filter for smooth bokeh. Unique character. Like new condition.', 150000),

-- Lighting Equipment
(1, 'Godox AD600Pro', 'Professional portable flash with 600Ws power, TTL support, high-speed sync. Location photography essential. Includes battery and charger.', 150000),
(2, 'Profoto B10 Plus', 'Compact 500Ws strobe with Bluetooth, continuous LED, beautiful light quality. Professional on-location flash.', 200000),

-- Camera Accessories
(3, 'DJI Ronin-S Gimbal', '3-axis motorized gimbal for DSLR and mirrorless cameras. Smooth video stabilization. Complete with all accessories and case.', 180000),
(4, 'Manfrotto 055 Carbon Fiber Tripod', 'Professional carbon fiber tripod with ball head, stable and lightweight. Maximum height 170cm.', 100000),
(5, 'Peak Design Everyday Backpack 30L', 'Professional camera backpack with customizable dividers, weatherproof, comfortable. Black color, excellent condition.', 80000),

-- Sound System & Audio Equipment
(6, 'Portable PA System 300W', 'Complete portable sound system with mixer, 2 speakers, microphone. Perfect for campus events, seminars, and outdoor activities. Easy setup.', 350000),
(7, 'Wireless Microphone Set (4 Units)', 'Professional UHF wireless microphone system with 4 handheld mics. Ideal for panel discussions, talent shows, and conferences.', 200000),
(8, 'Bluetooth Speaker JBL PartyBox 310', 'Powerful party speaker with RGB lights, microphone input, and 18-hour battery. Perfect for outdoor events and gatherings.', 150000),
(9, 'Lapel Microphone Set', 'Professional lavalier microphone system for interviews and presentations. Crystal clear audio quality. Includes 2 wireless transmitters.', 120000),

-- Event & Decoration Equipment
(10, 'Pop-up Tent 3x3m (White)', 'Professional grade pop-up canopy tent for outdoor events. Weather-resistant, easy assembly. Includes weights and carrying bag.', 200000),
(1, 'Backdrop Stand Adjustable 3x2.5m', 'Heavy-duty backdrop stand with adjustable height and width. Perfect for photo booth, stage backdrop, or branding displays.', 100000),
(2, 'LED String Lights 20m', 'Warm white LED fairy lights for decoration. Waterproof, low power consumption. Creates beautiful ambiance for any event.', 50000),
(3, 'Folding Tables (5 units)', 'Set of 5 folding tables 180x75cm. Perfect for registration desk, food station, or exhibition booth. Easy to transport and store.', 150000),
(4, 'Folding Chairs (20 units)', 'Set of 20 comfortable folding chairs. Suitable for seminars, workshops, and gatherings. Lightweight and stackable.', 200000),

-- Projection & Display Equipment
(5, 'Projector Epson EB-X41', 'Bright 3600 lumens projector for presentations and movie screenings. Includes HDMI cable, remote, and carrying case.', 250000),
(6, 'Portable Projector Screen 100 inch', 'Roll-up projection screen with tripod stand. 100 inch diagonal, 16:9 aspect ratio. Easy setup for any venue.', 80000),
(7, 'LED TV 55 inch with Stand', 'Smart LED TV 55 inch on mobile stand. Perfect for digital signage, presentations, or live streaming displays. Includes HDMI cables.', 300000),
(8, 'Laptop HP EliteBook i7', 'High-performance laptop for presentations and event management. Intel i7, 16GB RAM, 512GB SSD. Includes charger and mouse.', 200000),

-- Registration & Documentation
(9, 'Thermal Printer for ID Cards', 'Professional thermal printer for printing event badges and ID cards. Includes ribbon and 100 blank cards. Fast and reliable.', 150000),
(10, 'Barcode Scanner + Tablet Bundle', 'Complete registration system with barcode scanner and Android tablet. Perfect for check-in systems and attendance tracking.', 180000),
(1, 'Instant Print Camera Instax Wide', 'Fujifilm Instax Wide instant camera for event documentation. Creates fun memories instantly. Includes 20 film sheets.', 120000),

-- Gaming & Entertainment
(2, 'PlayStation 5 Console Bundle', 'PS5 console with 2 controllers and popular games. Perfect for gaming tournaments or entertainment booths. Complete setup included.', 400000),
(3, 'Nintendo Switch OLED with Games', 'Nintendo Switch OLED with 2 sets of Joy-Cons and multiplayer games. Great for casual gaming events and ice-breaking activities.', 250000),
(4, 'VR Headset Meta Quest 3', 'Virtual reality headset for immersive experiences. Perfect for tech exhibitions and interactive booths. Includes controllers and games.', 350000),

-- Sports & Outdoor Equipment
(5, 'Camping Tent 6-Person', 'Large family camping tent with rain fly and ground sheet. Perfect for outdoor events, camping trips, or emergency shelter.', 150000),
(6, 'Portable Generator 2000W', 'Quiet inverter generator for outdoor events. Powers sound systems, lights, and equipment. Includes extension cords.', 300000),
(7, 'Cooler Box 50L', 'Large insulated cooler box for beverages and food. Keeps items cold for 24+ hours. Essential for outdoor events.', 75000),
(8, 'Sports Equipment Set', 'Complete sports package: football, basketball, volleyball, badminton rackets, and shuttlecocks. Perfect for sports day events.', 100000);

-- =====================================================
-- 3. INSERT ITEM IMAGES
-- =====================================================

INSERT INTO item_images (item_id, image_order, image_url) VALUES
-- Canon EOS R5 Images (Item 1)
(1, 1, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800'),
(1, 2, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&crop=entropy'),
(1, 3, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&crop=top'),

-- Canon EOS 5D Mark IV (Item 2)
(2, 1, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'),
(2, 2, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&crop=entropy'),

-- Canon EOS R6 (Item 3)
(3, 1, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&sat=-100'),
(3, 2, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&crop=left'),

-- Sony A7 IV (Item 4)
(4, 1, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800'),
(4, 2, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&crop=entropy'),
(4, 3, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&crop=bottom'),

-- Sony A7S III (Item 5)
(5, 1, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&hue=180'),
(5, 2, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&hue=180&crop=top'),

-- Sony A7R V (Item 6)
(6, 1, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&contrast=110'),
(6, 2, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&contrast=110&crop=center'),

-- Nikon Z9 (Item 7)
(7, 1, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&brightness=95'),
(7, 2, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&brightness=95&crop=right'),
(7, 3, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&brightness=95&crop=left'),

-- Nikon Z6 II (Item 8)
(8, 1, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&hue=30'),
(8, 2, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&hue=30&crop=top'),

-- Nikon D850 (Item 9)
(9, 1, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&sepia=50'),
(9, 2, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&sepia=50&crop=bottom'),

-- Fujifilm X-T5 (Item 10)
(10, 1, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&hue=200'),
(10, 2, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&hue=200&crop=center'),

-- Fujifilm GFX 100S (Item 11)
(11, 1, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&contrast=105'),
(11, 2, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&contrast=105&crop=top'),
(11, 3, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&contrast=105&crop=bottom'),

-- Lenses (Items 12-18)
(12, 1, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&focus=lens'),
(13, 1, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&zoom=1.2'),
(14, 1, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&angle=side'),
(15, 1, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&angle=front'),
(16, 1, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&detail=lens'),
(17, 1, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&detail=glass'),
(18, 1, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&view=top'),
(19, 1, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&view=side'),

-- Lighting (Items 20-21)
(20, 1, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&item=flash'),
(21, 1, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&item=strobe'),

-- Accessories (Items 22-24)
(22, 1, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&item=gimbal'),
(23, 1, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&item=tripod'),
(24, 1, 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&item=bag'),

-- Sound System & Audio (Items 25-28)
(25, 1, 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800'),
(25, 2, 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&crop=top'),
(26, 1, 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800'),
(27, 1, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800'),
(28, 1, 'https://images.unsplash.com/photo-1545221308-9e2c08d6100d?w=800'),

-- Event & Decoration (Items 29-33)
(29, 1, 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800'),
(29, 2, 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&crop=center'),
(30, 1, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'),
(31, 1, 'https://images.unsplash.com/photo-1519167758481-83f29da8c424?w=800'),
(32, 1, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800'),
(33, 1, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800'),

-- Projection & Display (Items 34-37)
(34, 1, 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800'),
(34, 2, 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&crop=top'),
(35, 1, 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800'),
(36, 1, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800'),
(37, 1, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800'),

-- Registration & Documentation (Items 38-40)
(38, 1, 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800'),
(39, 1, 'https://images.unsplash.com/photo-1585974738771-84483dd9f89f?w=800'),
(40, 1, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&hue=90'),

-- Gaming & Entertainment (Items 41-43)
(41, 1, 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800'),
(41, 2, 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&crop=center'),
(42, 1, 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800'),
(43, 1, 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800'),

-- Sports & Outdoor (Items 44-47)
(44, 1, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'),
(45, 1, 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800'),
(46, 1, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'),
(47, 1, 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800'),
(47, 2, 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&crop=top');

-- =====================================================
-- 4. OPTIONAL: INSERT SAMPLE FAVORITES AND FOLLOWS
-- =====================================================

-- User Follows (Who follows whom)
INSERT INTO user_follows (follower_id, following_id) VALUES
(1, 2), (1, 3), (1, 4),
(2, 1), (2, 5), (2, 6),
(3, 1), (3, 2), (3, 7),
(4, 1), (4, 8),
(5, 2), (5, 9),
(6, 3), (6, 10),
(7, 1), (7, 4),
(8, 2), (8, 5),
(9, 3), (9, 6),
(10, 1), (10, 7);

-- Item Favorites (Users' favorite items)
INSERT INTO item_favorites (user_id, item_id) VALUES
(1, 4), (1, 6), (1, 12), (1, 25), (1, 34),
(2, 1), (2, 7), (2, 14), (2, 29), (2, 41),
(3, 2), (3, 5), (3, 15), (3, 30), (3, 42),
(4, 3), (4, 8), (4, 16), (4, 26), (4, 35),
(5, 1), (5, 9), (5, 17), (5, 31), (5, 43),
(6, 4), (6, 10), (6, 18), (6, 27), (6, 36),
(7, 5), (7, 11), (7, 20), (7, 32), (7, 44),
(8, 6), (8, 12), (8, 22), (8, 28), (8, 45),
(9, 7), (9, 13), (9, 23), (9, 33), (9, 46),
(10, 8), (10, 14), (10, 24), (10, 37), (10, 47);

-- =====================================================
-- END OF DUMMY DATA
-- =====================================================

-- To use this file:
-- 1. Make sure your database tables are created (run migrations first)
-- 2. Update password_hash values with actual bcrypt hashes
-- 3. Run: psql -U your_username -d your_database -f dummy_data.sql
-- Or copy and paste sections into your database client

-- Note: IDs will be auto-generated, so foreign key references should work automatically
