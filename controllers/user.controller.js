// Delete (Desactivación lógica)
function Deletproduct(app, pool) {
    app.delete('/products/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const resultado = await pool.query(`
                UPDATE products 
                SET active = FALSE,
                    deactivated_at = NOW(),
                    activated_at = NULL
                WHERE id_product = $1
                RETURNING *
            `, [id]);

            if (resultado.rows.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json({ message: 'Product deactivated', product: resultado.rows[0] });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
}

// Get y Get by ID
function UserRoutes(app, pool) {
    app.get('/products', async (req, res) => {
        try {
            const resultado = await pool.query(`
                SELECT 
                    p.id_product,
                    p.title_product,
                    p.description_product,
                    p.price_product,
                    p.rating_product,
                    p.stock_product,
                    p.thumbnail_product,
                    d.category_details,
                    d.brand_details,
                    d.weight_details,
                    d.warrantyinformation_details,
                    d.availabilitystatus_details
                FROM products p
                INNER JOIN details d ON p.id_product = d.id_product
                WHERE p.active = TRUE
            `);
            res.json(resultado.rows);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.get('/products/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const resultado = await pool.query(`
                SELECT p.*, d.*
                FROM products p
                INNER JOIN details d ON p.id_product = d.id_product
                WHERE p.id_product = $1 AND p.active = TRUE
            `, [id]);

            if (resultado.rows.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json(resultado.rows[0]);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
}

// Patch (Activar producto)
function Pathactive(app, pool) {
    app.patch('/products/:id/activate', async (req, res) => {
        try {
            const { id } = req.params;
            const resultado = await pool.query(`
                UPDATE products 
                SET active = TRUE,
                    activated_at = NOW(),
                    deactivated_at = NULL
                WHERE id_product = $1
                RETURNING *
            `, [id]);

            if (resultado.rows.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json({ message: 'Product activated', product: resultado.rows[0] });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
}

// Post (Con Transacción añadida para seguridad de datos)
function Postproducts(app, pool) {
    app.post('/products', async (req, res) => {
        const client = await pool.connect(); 
        try {
            const { 
                title_product, price_product, stock_product, description_product, rating_product,
                thumbnail_product, active, deactivated_at, category_details, brand_details, weight_details,
                warrantyinformation_details, shippinginformation_details, availabilitystatus_details
            } = req.body;

            await client.query('BEGIN'); 

            // INSERT 1 → tabla products
            const producto = await client.query(`
                INSERT INTO products (title_product, price_product, stock_product, description_product,
                rating_product, thumbnail_product, active, deactivated_at )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `, [title_product, price_product, stock_product, description_product, rating_product,
                thumbnail_product, active, deactivated_at
            ]);

            // INSERT 2 → tabla details
            const detalle = await client.query(`
                INSERT INTO details (category_details, brand_details, weight_details,
                warrantyinformation_details, shippinginformation_details, availabilitystatus_details, 
                id_product)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `, [category_details, brand_details, weight_details,
                warrantyinformation_details, shippinginformation_details, availabilitystatus_details,
                producto.rows[0].id_product]);

            await client.query('COMMIT'); 
            res.status(201).json({ producto: producto.rows[0], detalle: detalle.rows[0] });

        } catch (error) {
            await client.query('ROLLBACK'); 
            res.status(500).json({ message: error.message });
        } finally {
            client.release();
        }
    });
}

// Put
function Updatproducts(app, pool) {
    app.put('/products/:id', async (req, res) => {
        const client = await pool.connect();
        try {
            const { id } = req.params;
            const {
                title_product, price_product, stock_product,
                category_details, brand_details, availabilitystatus_details
            } = req.body;

            await client.query('BEGIN');

            await client.query(`
                UPDATE products SET
                    title_product  = $1,
                    price_product  = $2,
                    stock_product  = $3
                WHERE id_product = $4
            `, [title_product, price_product, stock_product, id]);

            await client.query(`
                UPDATE details SET
                    category_details          = $1,
                    brand_details             = $2,
                    availabilitystatus_details = $3
                WHERE id_product = $4
            `, [category_details, brand_details, availabilitystatus_details, id]);

            await client.query('COMMIT');
            res.json({ message: 'Product updated' });

        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ message: error.message });
        } finally {
            client.release();
        }
    });
}

module.exports = { Updatproducts, Postproducts, Pathactive, UserRoutes, Deletproduct };

