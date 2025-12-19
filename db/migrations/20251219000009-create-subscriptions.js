'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if table already exists
        const tableExists = await queryInterface.sequelize.query(
            `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = 'subscriptions'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (tableExists[0].count > 0) {
            console.log('⚠ Migration 009: Table "subscriptions" already exists, skipping...');
            return;
        }

        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.createTable('subscriptions', {
                id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    autoIncrement: true,
                    primaryKey: true,
                },
                user_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                stripe_subscription_id: {
                    type: Sequelize.STRING(255),
                    allowNull: false,
                },
                status: {
                    type: Sequelize.STRING(50),
                    allowNull: false,
                },
                current_period_end: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
                },
            }, { transaction });

            // Add indexes
            await queryInterface.addIndex('subscriptions', ['stripe_subscription_id'], {
                name: 'subscriptions_stripe_id_idx',
                transaction,
            });
            await queryInterface.addIndex('subscriptions', ['status'], {
                name: 'subscriptions_status_idx',
                transaction,
            });

            await transaction.commit();
            console.log('✓ Migration 009: Created subscriptions table');
        } catch (error) {
            await transaction.rollback();
            console.error('✗ Migration 009 failed:', error.message);
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        // Check if table exists before dropping
        const tableExists = await queryInterface.sequelize.query(
            `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = 'subscriptions'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (tableExists[0].count === 0) {
            console.log('⚠ Rollback 009: Table "subscriptions" does not exist, skipping...');
            return;
        }

        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.dropTable('subscriptions', { transaction });
            await transaction.commit();
            console.log('✓ Rollback 009: Dropped subscriptions table');
        } catch (error) {
            await transaction.rollback();
            console.error('✗ Rollback 009 failed:', error.message);
            throw error;
        }
    },
};
