const bcrypt = require('bcrypt');
module.exports = (sequelize, Sequelize) => {
        const User = sequelize.define("user", {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        first_name: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Last Name can not be empty!"
                },
                notEmpty: {
                    msg: "First Name field can not be empty!"
                }
            }
        },
        last_name: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Last Name can not be null!"
                },
                notEmpty: {
                    msg: "Last Name field can not be empty!"
                }
            }
        },
        username: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                isEmail: {
                    msg: "Username must be an Email"
                },
                notNull: {
                    msg: "Username field can not be null!"
                },
                notEmpty: {
                    msg: "Username field can not be empty!"
                }
            },
            unique: { args: true, msg: 'Email already in use !! Use a different Email ID !!!' }
        },
        password: {
            type: Sequelize.STRING,
            select: false,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Password field can not be Null!"
                },
                notEmpty: {
                    msg: "Password field can not be empty!"
                }
            }
        },
    },
    {   timestamps: true,
        createdAt: "account_created",
        updatedAt: "account_updated",
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    const salt = await bcrypt.genSaltSync(10, 'a');
                    user.password = bcrypt.hashSync(user.password, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.password) {
                    const salt = await bcrypt.genSaltSync(10, 'a');
                    user.password = bcrypt.hashSync(user.password, salt);
                }
            }
        }, 
        instanceMethods: {
            validPassword: (password) => {
             return bcrypt.compareSync(password, this.password);
            }
           }
       });

        // Ignore Password field from Response Payload
        User.prototype.toJSON =  function () {
            var values = Object.assign({}, this.get());
            delete values.password;
            return values;
        }

    return User;
  };