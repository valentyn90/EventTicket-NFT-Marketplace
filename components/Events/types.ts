export type EventType = {
  id: number;
  event_name: string;
  event_start: string;
  event_end: string;
  event_pic: string;
  event_pic_2: string;
  event_venue_name: string;
  event_street: string;
  event_city: string;
  event_state: string;
  description: string;
};

export type SelectedEventTicketType = {
  ticketId: string;
  ticketType: string;
  email: string;
  ticketPrice: string;
  quantity: number;
};
export type TicketType = {
  id: number;
  event_id: number;
  name: string;
  image: string;
  type: string;
  section: string;
  title: string;
  location: string;
  subtitle: string;
  price: number;
  stripe_product: string;
  supply_total: number;
  supply_remaining: number;
  utility: string[];
};
