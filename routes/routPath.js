function Pathactive(app,pool) {
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

        res.json({ message: 'Product activated', product: resultado.rows[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
}
module.exports = Pathactive;