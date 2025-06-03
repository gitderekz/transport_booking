class Transport {
  constructor({
    id,
    type,
    identifier,
    name,
    operator,
    total_seats,
    seat_layout,
    amenities,
    created_at,
    updated_at
  }) {
    this.id = id;
    this.type = type;
    this.identifier = identifier;
    this.name = name;
    this.operator = operator;
    this.totalSeats = total_seats;
    this.seatLayout = seat_layout;
    this.amenities = amenities;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }

  static fromJson(json) {
    return new Transport({
      ...json,
      seat_layout: typeof json.seat_layout === 'string' 
        ? JSON.parse(json.seat_layout) 
        : json.seat_layout,
      amenities: typeof json.amenities === 'string' 
        ? JSON.parse(json.amenities) 
        : json.amenities
    });
  }

  toJson() {
    return {
      id: this.id,
      type: this.type,
      identifier: this.identifier,
      name: this.name,
      operator: this.operator,
      total_seats: this.totalSeats,
      seat_layout: JSON.stringify(this.seatLayout),
      amenities: JSON.stringify(this.amenities),
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }
}

module.exports = Transport;