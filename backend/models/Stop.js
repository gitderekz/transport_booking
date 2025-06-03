class Stop {
  constructor({
    id,
    route_id,
    station_name,
    station_code,
    arrival_time,
    departure_time,
    sequence_order,
    additional_fee,
    created_at
  }) {
    this.id = id;
    this.routeId = route_id;
    this.stationName = station_name;
    this.stationCode = station_code;
    this.arrivalTime = arrival_time;
    this.departureTime = departure_time;
    this.sequenceOrder = sequence_order;
    this.additionalFee = additional_fee;
    this.createdAt = created_at;
  }

  static fromJson(json) {
    return new Stop(json);
  }

  toJson() {
    return {
      id: this.id,
      route_id: this.routeId,
      station_name: this.stationName,
      station_code: this.stationCode,
      arrival_time: this.arrivalTime,
      departure_time: this.departureTime,
      sequence_order: this.sequenceOrder,
      additional_fee: this.additionalFee,
      created_at: this.createdAt
    };
  }
}

module.exports = Stop;