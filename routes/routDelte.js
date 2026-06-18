function Deletproduct(app,pool) {
    //Delet
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
        res.json({ message: 'Product deactivated', product: resultado.rows[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
}
module.exports = Deletproduct;