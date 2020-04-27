/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('prometheus_user_table', {
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    account_reset_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    account_reset_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    account_created_dt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    account_updated_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    account_details: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    authorised_tenants: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: '[]'
    },
    account_hash: {
      type: DataTypes.STRING,
      allowNull: true
    },
    account_pass: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'prometheus_user_table'
  });
};
