function Updatproducts(app,pool) {
    //Put
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
module.exports = Updatproducts;