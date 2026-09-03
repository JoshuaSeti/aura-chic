insert into public.categories (name, slug) select 'Sets','sets' where not exists (select 1 from public.categories where slug='sets');
with cat as (select id, slug from public.categories)
insert into public.products (name, slug, description, price, category_id, image_url, images, sizes, colors, in_stock, featured, color_images)
values
('Sunflower Dress','sunflower-dress','A celebration of radiance and femininity. The Sunflower Dress flows with soft elegance, featuring delicate draped details and a flattering silhouette that moves with you.

- Draped shoulder detail
- Ruched silhouette
- Back zipper closure
- Back slit for ease
- Premium stretch fabric
- Fully lined',2499,(select id from cat where slug='dresses'),'/__l5e/assets-v1/9e4c4066-0fa5-41c2-a299-b3594a51330f/p05_3_344.jpeg',ARRAY['/__l5e/assets-v1/9e4c4066-0fa5-41c2-a299-b3594a51330f/p05_3_344.jpeg','/__l5e/assets-v1/e632c935-5577-4de3-a8e2-7a2a06a0fa15/p05_1_342.jpeg','/__l5e/assets-v1/8a9fef43-e853-4c88-947b-fed7b9c10bd4/p05_2_343.jpeg']::text[],ARRAY['36','38','40','42','44','46','48','50','52','54','56']::text[],ARRAY['Yellow']::text[],true,false,'{}'::jsonb),
('The Belle Dress','the-belle-dress','The Belle Dress is a timeless dream crafted for the woman who loves to stand out with softness and grace. With its floral embellished bodice and flowing tulle skirt, it brings effortless elegance to any special occasion.

- Off-shoulder floral bodice
- 3D floral applique details
- Structured corset design
- Flowing layered tulle skirt
- Lined for comfort
- Back zip closure
- Comfortable fit',2899,(select id from cat where slug='dresses'),'/__l5e/assets-v1/892343da-5da8-495a-9ae4-3e7be713fc43/p06_1_349.jpeg',ARRAY['/__l5e/assets-v1/892343da-5da8-495a-9ae4-3e7be713fc43/p06_1_349.jpeg','/__l5e/assets-v1/297aad28-45e1-4b5e-9fda-3da4119e4409/p06_2_350.jpeg','/__l5e/assets-v1/cca42c02-5401-4df9-a8ae-1dca65774a0d/p06_3_351.jpeg']::text[],ARRAY['36','38','40','42','44','46','48','50','52','54','56']::text[],ARRAY['Mustard']::text[],true,false,'{}'::jsonb),
('Elegance in Green','elegance-in-green','An unforgettable statement in emerald. Beaded detail meets soft mesh and textured ruffles for a silhouette made for the spotlight.

- Beaded and sequin illusion bodice
- Draped mesh neckline
- Sheer long sleeves
- Textured ruffle skirt
- Back zip closure
- Fully lined',3399,(select id from cat where slug='dresses'),'/__l5e/assets-v1/990aad4a-dc1a-41b7-836e-3a939533c03a/p07_1_356.jpeg',ARRAY['/__l5e/assets-v1/990aad4a-dc1a-41b7-836e-3a939533c03a/p07_1_356.jpeg','/__l5e/assets-v1/a9ca5344-fa57-46a1-ac28-e6504fd0b76e/p07_2_357.jpeg']::text[],ARRAY['36','38','40','42','44','46','48','50','52','54','56']::text[],ARRAY['Green']::text[],true,false,'{}'::jsonb),
('Sunshine Set','sunshine-set','Radiant from top to hem. A sequin top paired with a high-waisted maxi skirt for a look that glows in every room.

- Sequin embellished top
- Sleeveless cut
- Concealed front zip
- Stretch lining
- High-waisted maxi skirt
- Back zip closure',2499,(select id from cat where slug='sets'),'/__l5e/assets-v1/675613f6-9e61-4d62-907f-2d331257127b/p08_3_364.jpeg',ARRAY['/__l5e/assets-v1/675613f6-9e61-4d62-907f-2d331257127b/p08_3_364.jpeg','/__l5e/assets-v1/9210a65f-f077-45bf-83e1-6670032e3f1a/p08_1_362.jpeg','/__l5e/assets-v1/e6f6f2d1-2b6e-46f9-bf1a-54805297bac9/p08_2_363.jpeg']::text[],ARRAY['36','38','40','42','44','46','48','50','52','54','56']::text[],ARRAY['Yellow']::text[],true,false,'{}'::jsonb),
('The Daring Set','the-daring-set','Bold, confident and unapologetically stylish. The Daring Set is designed for women who love to make a statement wherever they go.

- Crop top with wide straps
- High-waisted statement skirt
- Side draped ruffle details
- Back zipper closure
- Fully lined for comfort
- Comfortable fit',1699,(select id from cat where slug='sets'),'/__l5e/assets-v1/1398d642-d7f8-4945-8d13-f679e28c4638/p09_1_369.jpeg',ARRAY['/__l5e/assets-v1/1398d642-d7f8-4945-8d13-f679e28c4638/p09_1_369.jpeg']::text[],ARRAY['36','38','40','42','44','46','48','50','52','54','56']::text[],ARRAY['Olive','Burgundy']::text[],true,false,'{}'::jsonb),
('The Beloved Dress','the-beloved-dress','Soft petals, sculpted lines. The Beloved Dress pairs a 3D petal bodice with a flowing tulle skirt for pure romance.

- 3D petal embellished bodice
- High neckline
- Sleeveless design
- Fitted waist with peplum
- Flowing tulle skirt
- Concealed back zip
- Fully lined',2899,(select id from cat where slug='dresses'),'/__l5e/assets-v1/4dc43eb9-7fae-472a-a0c0-ec2584d68623/p10_1_374.jpeg',ARRAY['/__l5e/assets-v1/4dc43eb9-7fae-472a-a0c0-ec2584d68623/p10_1_374.jpeg','/__l5e/assets-v1/d1902c24-3443-4c6f-bbc0-64a41fcf3a24/p10_2_375.jpeg','/__l5e/assets-v1/35bb6a04-94c5-4ee1-9e74-fa287497adaf/p10_3_376.jpeg']::text[],ARRAY['36','38','40','42','44','46','48','50','52','54','56']::text[],ARRAY['Blue']::text[],true,false,'{}'::jsonb),
('Green with Passion Set','green-with-passion-set','Sculpted detail with effortless movement. A braided high neck top layered over a flowing chiffon maxi skirt.

- Braided high neck detail
- Sleeveless design
- Contrast panel detail
- Asymmetric layered top
- Chiffon maxi skirt
- Back zip closure
- Comfortable fit',2199,(select id from cat where slug='sets'),'/__l5e/assets-v1/9fbfc0c2-ed89-4e82-b197-012198e3d59d/p11_2_382.jpeg',ARRAY['/__l5e/assets-v1/9fbfc0c2-ed89-4e82-b197-012198e3d59d/p11_2_382.jpeg','/__l5e/assets-v1/f44cb281-adef-4974-93bd-89e2e17f8b12/p11_1_381.jpeg','/__l5e/assets-v1/80a2a31e-9ea3-4c08-9f6d-72051dbe66ef/p11_3_383.jpeg']::text[],ARRAY['36','38','40','42','44','46','48','50','52','54','56']::text[],ARRAY['Green']::text[],true,false,'{}'::jsonb),
('Blissfully Blue Set','blissfully-blue-set','Delicate lace, timeless polish. A floral lace button-up top with a matching midi lace skirt for refined day-to-evening dressing.

- Floral lace button-up top
- Matching midi lace skirt
- Collar detail
- Lined throughout
- Scalloped hem
- Back zip closure
- Comfortable fit',2499,(select id from cat where slug='sets'),'/__l5e/assets-v1/e8f1ae2a-b47d-42b1-ada4-a23775361ea2/p12_1_388.jpeg',ARRAY['/__l5e/assets-v1/e8f1ae2a-b47d-42b1-ada4-a23775361ea2/p12_1_388.jpeg','/__l5e/assets-v1/5627ef04-da70-407c-9806-b04928328ab7/p12_2_389.jpeg','/__l5e/assets-v1/2b8fcf34-92e9-4cf2-95f7-da78041adc49/p12_3_390.jpeg']::text[],ARRAY['36','38','40','42','44','46','48','50','52','54','56']::text[],ARRAY['Blue']::text[],true,false,'{}'::jsonb),
('Zebra Set','zebra-set','Bold. Effortless. Unapologetically you. The Zebra Set is your ultimate power look, designed to turn heads and own every moment.

- Fitted sweetheart neckline top
- High-waisted wrap-style pants
- Zebra print statement piece
- Comfortable and flattering fit
- Perfect for day or night',1799,(select id from cat where slug='sets'),'/__l5e/assets-v1/fb9d0f23-ce74-413b-bffc-ae579d794580/p13_2_396.jpeg',ARRAY['/__l5e/assets-v1/fb9d0f23-ce74-413b-bffc-ae579d794580/p13_2_396.jpeg','/__l5e/assets-v1/bee3ff2f-0401-4a91-9c83-009796216a13/p13_3_397.jpeg','/__l5e/assets-v1/487459ec-8581-49da-bc2e-c2db018fb8d3/p13_4_398.jpeg']::text[],ARRAY['36','38','40','42','44','46','48','50','52','54','56']::text[],ARRAY['Red','Zebra Print']::text[],true,false,'{}'::jsonb),
('The Olive Set','the-olive-set','Easy elegance in a warm olive tone. A ruched peplum top paired with breezy wide-leg pants.

- Halter neck design
- Ruched bust detail
- Peplum top
- Wide-leg pants
- Side pockets
- Breathable fabric
- Comfortable fit',1499,(select id from cat where slug='sets'),'/__l5e/assets-v1/91f3cd0a-4351-4ea8-8968-c31cad3fc61c/p14_2_404.jpeg',ARRAY['/__l5e/assets-v1/91f3cd0a-4351-4ea8-8968-c31cad3fc61c/p14_2_404.jpeg','/__l5e/assets-v1/ed0a2ac5-b134-4f41-8414-476a7a502f08/p14_1_403.jpeg','/__l5e/assets-v1/1a59b43d-101a-4587-9430-e245ac7175e2/p14_3_405.jpeg']::text[],ARRAY['36','38','40','42','44','46','48','50','52','54','56']::text[],ARRAY['Olive']::text[],true,false,'{}'::jsonb),
('Pink & Teal Elegance','pink-and-teal-elegance','Make a statement in this show-stopping two-tone dress that blends sparkle with sophistication. Perfect for special occasions where you want all eyes on you.

- Sequin embellished bodice
- Strapless sweetheart neckline
- Corset-style fit
- Flowing chiffon skirt
- Back zip closure
- Fully lined for comfort',2899,(select id from cat where slug='dresses'),'/__l5e/assets-v1/f9840b35-70b6-4b76-b980-4f665919c0ed/p15_1_410.jpeg',ARRAY['/__l5e/assets-v1/f9840b35-70b6-4b76-b980-4f665919c0ed/p15_1_410.jpeg','/__l5e/assets-v1/f3490ade-c814-4dd6-922a-09704d2cf758/p15_2_411.jpeg']::text[],ARRAY['36','38','40','42','44','46','48','50','52','54','56']::text[],ARRAY['Pink','Teal']::text[],true,false,'{}'::jsonb),
('Polka Dotted Dress','polka-dotted-dress','A playful classic with a polished finish. Crisp piping and side ties shape an easy, flattering knee-length silhouette.

- Sleeveless design
- Round neckline
- Black piping detail
- Side tie detail
- Comfortable fit
- Knee length',1950,(select id from cat where slug='dresses'),'/__l5e/assets-v1/bebb527d-b55c-492e-9020-09c068ca04a4/p16_1_417.jpeg',ARRAY['/__l5e/assets-v1/bebb527d-b55c-492e-9020-09c068ca04a4/p16_1_417.jpeg','/__l5e/assets-v1/92450221-57ba-4a25-9131-13143c5ed3b5/p16_2_418.jpeg','/__l5e/assets-v1/a611b8a1-c32b-4ba6-b852-30e8381c44c3/p16_3_419.jpeg']::text[],ARRAY['36','38','40','42','44','46','48','50','52','54','56']::text[],ARRAY['Black','White']::text[],true,false,'{}'::jsonb),
('Jumper Piece','jumper-piece','Chic, versatile, and effortlessly polished. This Jumper Piece combines a sleek high neckline with wide-leg comfort for a look that transitions seamlessly from day to night.

- Sleeveless high-neck design
- Wide-leg fit
- Back zip closure
- Side pockets
- Comfortable stretch fabric
- Easy to style',1499,(select id from cat where slug='sets'),'/__l5e/assets-v1/1038b1a7-fdd9-4571-a300-e6e52271bc61/p17_2_425.jpeg',ARRAY['/__l5e/assets-v1/1038b1a7-fdd9-4571-a300-e6e52271bc61/p17_2_425.jpeg','/__l5e/assets-v1/b24e0b5b-9e11-4717-a2dd-242b2c13c739/p17_1_424.jpeg']::text[],ARRAY['36','38','40','42','44','46','48','50','52','54','56']::text[],ARRAY['Olive','Burgundy']::text[],true,false,'{}'::jsonb),
('Shades of Blue','shades-of-blue','Ombre blues melt into a soft mermaid hem for a dress that moves like water.

- Ruched mesh bodice
- Ombre blue tones
- Tulle mermaid hem
- Sleeveless design
- Fully lined
- Back zip closure
- Comfortable fit',1799,(select id from cat where slug='dresses'),'/__l5e/assets-v1/cb1493e7-7bec-41b0-93cc-e270fad6d77d/p18_1_430.jpeg',ARRAY['/__l5e/assets-v1/cb1493e7-7bec-41b0-93cc-e270fad6d77d/p18_1_430.jpeg','/__l5e/assets-v1/6b9b300d-4340-4524-85a4-e2d068c0e0e4/p18_2_431.jpeg','/__l5e/assets-v1/12c29e20-d61d-4712-aa54-8b64f9f76b62/p18_3_432.jpeg']::text[],ARRAY['36','38','40','42','44','46','48','50','52','54','56']::text[],ARRAY['Blue']::text[],true,false,'{}'::jsonb),
('Blossom Sky Dress','blossom-sky-dress','Embroidered blooms on airy tulle. The Blossom Sky Dress is soft, romantic and made to be remembered.

- Floral embroidered bodice
- Sleeveless design
- Layered tulle skirt
- Lined for comfort
- Back zip closure
- Comfortable fit',2299,(select id from cat where slug='dresses'),'/__l5e/assets-v1/db5e7c95-a4ae-41d7-bd5d-a64104ac7f6d/p19_1_437.jpeg',ARRAY['/__l5e/assets-v1/db5e7c95-a4ae-41d7-bd5d-a64104ac7f6d/p19_1_437.jpeg','/__l5e/assets-v1/60f25863-3135-4414-9f22-3512a80fdbc3/p19_2_438.jpeg','/__l5e/assets-v1/5e2ae527-a103-47ae-9888-efeed3759dbf/p19_3_439.jpeg']::text[],ARRAY['36','38','40','42','44','46','48','50','52','54','56']::text[],ARRAY['Blue']::text[],true,false,'{}'::jsonb)
on conflict (slug) do update set description=excluded.description, price=excluded.price, category_id=excluded.category_id, image_url=excluded.image_url, images=excluded.images, sizes=excluded.sizes, colors=excluded.colors;