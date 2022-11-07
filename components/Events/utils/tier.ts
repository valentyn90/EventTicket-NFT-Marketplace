import { TicketType } from "../types";

export const eventTabs: TicketType[] = [
  {
    id: 2,
    event_id: 1,
    title: "Tier 3",
    name: "Legendary",
    section: "Courtside",
    location: "Courtside",
    image: "/img/ticket/ticket.png",
    type: "Legendary", 
    subtitle: "The Best Seats with the Most Utility",
    price: 295,
    stripe_product: "prod_MitEMJRzQ93r1k",
    supply_total: 20,
    supply_remaining: 20,
    utility: ["Courtside seat", "Physical AR card upon arrival", "Access to The Battleground 2k23","Hospitality Room + Free Food/Drinks","The BattleGround 2k22 T-Shirt","1 in 20 chance to enter team of choice locker room","1 in 20 chance of player autograph","1 in 20 chance of a Jumbotron shoutout"],
    front_video: true
  }
  ,
  {
    id: 1,
    event_id: 1,
    title: "Tier 2",
    name: "Rare",
    section: "Sideline",
    location: "Rows B & 1",
    image: "/img/ticket/ticket.png",
    type: "Rare",
    subtitle: "Great seats, even better collectible",
    price: 150,
    stripe_product: "prod_MitDhAAgBgcooe",
    supply_total: 60,
    supply_remaining: 60,
    utility: ["Sideline seating in first 3 rows","Physical AR card upon arrival","1 in 60 chance for a player autograph","1 in 60 chance for team sweatshirt","1 in 60 chance to attend pre-game shoot around"],
    front_video: true
  },
  {
    id: 0,
    event_id: 1,
    title: "Tier 1",
    name: "Elite",
    section: "Sideline",
    location: "Rows 5-8",
    image: "/img/ticket/ticket.png",
    type: "Common",
    subtitle: "Be a part of the future of fandom",
    price: 115,
    stripe_product: "prod_MitCsAR50XbEmw",
    supply_total: 120,
    supply_remaining: 120, // Not used
    utility: ["Sideline seating in rows 5-8", "Physical AR card upon arrival", "1 in 120 chance for a signed basketball"],
    front_video: false
  },

];
