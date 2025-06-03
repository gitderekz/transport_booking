class Route {
  constructor({
    id,
    transport_id,
    origin,
    destination,
    base_price,
    duration_minutes,
    active,
    created_at
  }) {
    this.id = id;
    this.transportId = transport_id;
    this.origin = origin;
    this.destination = destination;
    this.basePrice = base_price;
    this.durationMinutes = duration_minutes;
    this.active = active;
    this.createdAt = created_at;
  }

  static fromJson(json) {
    return new Route(json);
  }

  toJson() {
    return {
      id: this.id,
      transport_id: this.transportId,
      origin: this.origin,
      destination: this.destination,
      base_price: this.basePrice,
      duration_minutes: this.durationMinutes,
      active: this.active,
      created_at: this.createdAt
    };
  }
}

module.exports = Route;