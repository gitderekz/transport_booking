module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      defaultValue: 'male'
    },
    age: {
      type: DataTypes.INTEGER,
      defaultValue: 18,
      validate: {
        min: 0
      }
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verification_token: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    language_pref: {
      type: DataTypes.ENUM('en', 'sw', 'sp', 'fr'),
      defaultValue: 'en'
    },
    theme_pref: {
      type: DataTypes.ENUM('light', 'dark', 'system'),
      defaultValue: 'system'
    }
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'users',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['phone']
      },
      {
        fields: ['is_verified', 'verification_token']
      }
    ]
  });

  User.associate = (models) => {
    User.hasMany(models.Booking, {
      foreignKey: 'user_id',
      as: 'bookings'
    });
  };

  return User;
};



// module.exports = (sequelize, DataTypes) => {
//   const User = sequelize.define('User', {
//     uuid: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       allowNull: false,
//       unique: true
//     },
//     email: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       unique: true,
//       validate: {
//         isEmail: true
//       }
//     },
//     phone: {
//       type: DataTypes.STRING(20),
//       allowNull: true,
//       unique: true
//     },
//     password_hash: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     first_name: {
//       type: DataTypes.STRING(100),
//       allowNull: true
//     },
//     last_name: {
//       type: DataTypes.STRING(100),
//       allowNull: true
//     },
//     is_verified: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false
//     },
//     verification_token: {
//       type: DataTypes.STRING(100),
//       allowNull: true
//     },
//     language_pref: {
//       type: DataTypes.ENUM('en', 'sw', 'sp', 'fr'),
//       defaultValue: 'en'
//     },
//     theme_pref: {
//       type: DataTypes.ENUM('light', 'dark', 'system'),
//       defaultValue: 'system'
//     }
//   }, {
//     timestamps: true,
//     createdAt: 'created_at',
//     updatedAt: 'updated_at',
//     tableName: 'users',
//     indexes: [
//       {
//         unique: true,
//         fields: ['email']
//       },
//       {
//         unique: true,
//         fields: ['phone']
//       }
//     ]
//   });

//   return User;
// };
// // *********************



// class User {
//   constructor({
//     id,
//     uuid,
//     email,
//     phone,
//     first_name,
//     last_name,
//     is_verified,
//     verification_token,
//     language_pref,
//     theme_pref,
//     profile_picture,
//     created_at,
//     updated_at
//   }) {
//     this.id = id;
//     this.uuid = uuid;
//     this.email = email;
//     this.phone = phone;
//     this.firstName = first_name;
//     this.lastName = last_name;
//     this.isVerified = is_verified;
//     this.verificationToken = verification_token;
//     this.languagePref = language_pref;
//     this.themePref = theme_pref;
//     this.profilePicture = profile_picture;
//     this.createdAt = created_at;
//     this.updatedAt = updated_at;
//   }

//   static fromJson(json) {
//     return new User(json);
//   }

//   toJson() {
//     return {
//       id: this.id,
//       uuid: this.uuid,
//       email: this.email,
//       phone: this.phone,
//       first_name: this.firstName,
//       last_name: this.lastName,
//       is_verified: this.isVerified,
//       verification_token: this.verificationToken,
//       language_pref: this.languagePref,
//       theme_pref: this.themePref,
//       profile_picture: this.profilePicture,
//       created_at: this.createdAt,
//       updated_at: this.updatedAt
//     };
//   }
// }

// module.exports = User;