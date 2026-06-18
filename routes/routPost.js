function Postproducts(app, pool) {
    //Post
    app.post('/products', async (req, res) => {
        try {
            const { title_product, price_product, stock_product, description_product, rating_product,
                thumbnail_product, active, deactivated_at, category_details, brand_details, weight_details,
                warrantyinformation_details, shippinginformation_details, availabilitystatus_details
            } = req.body;

            const producto = await pool.query(`
            INSERT INTO products (title_product, price_product, stock_product, description_product,
            rating_product, thumbnail_product, active, deactivated_at )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [title_product, price_product, stock_product, description_product, rating_product,
                thumbnail_product, active, deactivated_at
            ]);

            // INSERT 2 → tabla details
            const detalle = await pool.query(`
            INSERT INTO details (category_details, brand_details, weight_details,
            warrantyinformation_details, shippinginformation_details, availabilitystatus_details, 
            id_product)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [category_details, brand_details, weight_details,
                warrantyinformation_details, shippinginformation_details, availabilitystatus_details,
                producto.rows[0].id_product]);
            res.status(201).json({ producto: producto.rows[0], detalle: detalle.rows[0] });

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
}
module.exports = Postproducts;