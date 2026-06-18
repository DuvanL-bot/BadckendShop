function UserRoutes(app, pool) {
    //Get
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

    //Get by id
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

module.exports = UserRoutes