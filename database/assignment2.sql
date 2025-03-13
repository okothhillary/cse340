--1. Data for `account` table
INSERT INTO public.account (
	account_firstname, 
	account_lastname, 
	account_email, 
	account_password)
VALUES 
	('Tony',
    'Stark',
    'tony@starkent.com',
    'Iam1ronM@n');

--2. Update the account_type to Admin for Tony Stark

UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com'; 

--3. Delete Tony Stark record from the db

DELETE FROM public.account
WHERE account_email = 'tony@starkent.com';

--4. the inv_description for the Hummer to 'huge interior' from 'small interiors'

UPDATE
  public.inventory
SET
  inv_description = REPLACE(inv_description, 'small interiors', 'huge interior')
WHERE
  inv_make = 'GM' AND inv_model = 'Hummer' AND inv_year = '2016';

--5. Inner Join to get the inv_make, inv_model, and classification_name for all the vehicles that have a classification of 'Sport'
SELECT 
    inv.inv_make,
    inv.inv_model,
    class.classification_name
FROM 
    public.inventory AS inv
INNER JOIN 
    public.classification AS class
ON 
    inv.classification_id = class.classification_id
WHERE 
    class.classification_name = 'Sport';


--6. update filepath for all images and thumbnails to include '/vehicles' in the path
UPDATE public.inventory
SET 
    inv_image = REPLACE(inv_image, '/images', '/images/vehicles'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images', '/images/vehicles');    
