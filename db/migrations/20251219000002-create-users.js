'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if table already exists
        const tableExists = await queryInterface.sequelize.query(
            `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = 'users'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (tableExists[0].count > 0) {
            console.log('⚠ Migration 002: Table "users" already exists, skipping...');
            return;
        }

        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.createTable('users', {
                id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    autoIncrement: true,
                    primaryKey: true,
                },
                name: {
                    type: Sequelize.STRING(255),
                    allowNull: false,
                    defaultValue: '',
                },
                profile_image: {
                    type: Sequelize.STRING(255),
                    allowNull: true,
                },
                email: {
                    type: Sequelize.STRING(255),
                    allowNull: false,
                    unique: true,
                },
                user_name: {
                    type: Sequelize.STRING(255),
                    allowNull: true,
                },
                phone: {
                    type: Sequelize.STRING(50),
                    allowNull: true,
                },
                is_verified: {
                    type: Sequelize.TINYINT(1),
                    allowNull: false,
                    defaultValue: 0,
                },
                stripe_customer_id: {
                    type: Sequelize.STRING(255),
                    allowNull: true,
                },
                passWord: {
                    type: Sequelize.STRING(255),
                    allowNull: false,
                },
                salt: {
                    type: Sequelize.STRING(255),
                    allowNull: true,
                },
                active: {
                    type: Sequelize.TINYINT(1),
                    allowNull: false,
                    defaultValue: 1,
                },
                userrole_id: {
                    type: Sequelize.INTEGER.UNSIGNED,
                    allowNull: false,
                    defaultValue: 3,
                    references: {
                        model: 'roles',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'RESTRICT',
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
                deletedAt: {
                    type: Sequelize.DATE,
                    allowNull: true,
                },
            }, { transaction });

            // Add indexes
            await queryInterface.addIndex('users', ['email'], {
                name: 'users_email_idx',
                transaction,
            });
            await queryInterface.addIndex('users', ['user_name'], {
                name: 'users_user_name_idx',
                transaction,
            });
            await queryInterface.addIndex('users', ['active'], {
                name: 'users_active_idx',
                transaction,
            });

            await transaction.commit();
            console.log('✓ Migration 002: Created users table with indexes');
        } catch (error) {
            await transaction.rollback();
            console.error('✗ Migration 002 failed:', error.message);
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        // Check if table exists before dropping
        const tableExists = await queryInterface.sequelize.query(
            `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = 'users'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (tableExists[0].count === 0) {
            console.log('⚠ Rollback 002: Table "users" does not exist, skipping...');
            return;
        }

        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.dropTable('users', { transaction });
            await transaction.commit();
            console.log('✓ Rollback 002: Dropped users table');
        } catch (error) {
            await transaction.rollback();
            console.error('✗ Rollback 002 failed:', error.message);
            throw error;
        }
    },
};
