import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

const pendingPaymentsQuery = `
WITH pending_order_payments AS (
    SELECT
        o.id AS order_id,
        o.order_number,
        o.status AS order_status,
        o.payment_status AS order_payment_status,
        p.id AS payment_id,
        p.status AS payment_status,
        p.payment_method,
        p.amount,
        u.id AS user_id,
        u.name,
        u.email,
        ua.id AS shipping_address_id,
        ua.address_line1,
        ua.address_line2,
        ua.city,
        ua.state,
        ua.country,
        ua.postcode,
        ua.phone_number,
        ROW_NUMBER() OVER (
            PARTITION BY o.id
            ORDER BY p.id DESC
        ) AS rn
    FROM orders o
    JOIN payments p ON p.order_id = o.id
    JOIN users u ON u.id = o.user_id
    LEFT JOIN user_addresses ua ON ua.id = o.shipping_address_id
    WHERE p.status = 'PENDING'
)
SELECT
    pop.order_id,
    pop.order_number,
    pop.order_status,
    pop.order_payment_status,
    pop.payment_id,
    pop.payment_status,
    pop.payment_method,
    pop.amount AS payment_amount,
    pop.user_id,
    pop.name,
    pop.email,
    pop.shipping_address_id,
    pop.address_line1,
    pop.address_line2,
    pop.city,
    pop.state,
    pop.country,
    pop.postcode,
    pop.phone_number,
    COUNT(oi.id) AS item_count,
    COALESCE(SUM(oi.quantity), 0) AS total_qty,
    COALESCE(SUM(oi.subtotal), 0) AS items_subtotal,
    GROUP_CONCAT(DISTINCT pv.sku ORDER BY pv.sku SEPARATOR ', ') AS skus,
    GROUP_CONCAT(
        DISTINCT CONCAT(
            pr.name,
            ' (',
            COALESCE(pv.color, '-'),
            '/',
            COALESCE(pv.size, '-'),
            ')'
        )
        ORDER BY pr.name
        SEPARATOR ' | '
    ) AS products,
    GROUP_CONCAT(
        CONCAT(
            '#', oi.id,
            ':', pr.name,
            ' x', oi.quantity,
            ' @', oi.price
        )
        ORDER BY oi.id
        SEPARATOR ' || '
    ) AS item_lines
FROM pending_order_payments pop
LEFT JOIN order_items oi
    ON oi.order_id = pop.order_id
LEFT JOIN product_variants pv
    ON pv.id = oi.product_variant_id
LEFT JOIN products pr
    ON pr.id = pv.product_id
WHERE pop.rn = 1
GROUP BY
    pop.order_id,
    pop.order_number,
    pop.order_status,
    pop.order_payment_status,
    pop.payment_id,
    pop.payment_status,
    pop.payment_method,
    pop.amount,
    pop.user_id,
    pop.name,
    pop.email,
    pop.shipping_address_id,
    pop.address_line1,
    pop.address_line2,
    pop.city,
    pop.state,
    pop.country,
    pop.postcode,
    pop.phone_number
ORDER BY pop.order_id DESC;
`;

function getDbConfig() {
    return {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    };
}

export async function getPendingPaymentsReport() {
    const databaseUrl = process.env.DATABASE_URL;
    let connection;

    if (databaseUrl) {
        connection = await mysql.createConnection(databaseUrl);
    } else {
        const dbConfig = getDbConfig();
        const missing = ['DB_USER', 'DB_PASSWORD', 'DB_NAME'].filter((key) => !process.env[key]);

        if (missing.length > 0) {
            throw new Error(`Missing required DB env vars: ${missing.join(', ')}`);
        }

        connection = await mysql.createConnection(dbConfig);
    }

    try {
        const [rows] = await connection.query(pendingPaymentsQuery);
        return rows;
    } finally {
        await connection.end();
    }
}
