class Booking {
  constructor({
    id,
    booking_reference,
    user_id,
    route_id,
    transport_id,
    pickup_stop_id,
    dropoff_stop_id,
    total_price,
    status,
    payment_status,
    payment_method,
    notes,
    created_at,
    updated_at
  }) {
    this.id = id;
    this.bookingReference = booking_reference;
    this.userId = user_id;
    this.routeId = route_id;
    this.transportId = transport_id;
    this.pickupStopId = pickup_stop_id;
    this.dropoffStopId = dropoff_stop_id;
    this.totalPrice = total_price;
    this.status = status;
    this.paymentStatus = payment_status;
    this.paymentMethod = payment_method;
    this.notes = notes;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }

  static fromJson(json) {
    return new Booking(json);
  }

  toJson() {
    return {
      id: this.id,
      booking_reference: this.bookingReference,
      user_id: this.userId,
      route_id: this.routeId,
      transport_id: this.transportId,
      pickup_stop_id: this.pickupStopId,
      dropoff_stop_id: this.dropoffStopId,
      total_price: this.totalPrice,
      status: this.status,
      payment_status: this.paymentStatus,
      payment_method: this.paymentMethod,
      notes: this.notes,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }
}

module.exports = Booking;