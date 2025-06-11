class User {
  constructor({
    id,
    uuid,
    email,
    phone,
    first_name,
    last_name,
    gender,
    age,
    is_verified,
    verification_token,
    language_pref,
    theme_pref,
    profile_picture,
    created_at,
    updated_at
  }) {
    this.id = id;
    this.uuid = uuid;
    this.email = email;
    this.phone = phone;
    this.firstName = first_name;
    this.lastName = last_name;
    this.gender = gender;
    this.age = age;
    this.isVerified = is_verified;
    this.verificationToken = verification_token;
    this.languagePref = language_pref;
    this.themePref = theme_pref;
    this.profilePicture = profile_picture;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }

  static fromJson(json) {
    return new User(json);
  }

  toJson() {
    return {
      id: this.id,
      uuid: this.uuid,
      email: this.email,
      phone: this.phone,
      first_name: this.firstName,
      last_name: this.lastName,
      gender: this.gender,
      age: this.age,
      is_verified: this.isVerified,
      verification_token: this.verificationToken,
      language_pref: this.languagePref,
      theme_pref: this.themePref,
      profile_picture: this.profilePicture,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }
}

module.exports = User;