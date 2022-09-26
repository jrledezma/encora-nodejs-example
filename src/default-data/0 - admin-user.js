db.users.insert({
  firstName: "admin",
  lastName: "user",
  email: "contact@absquesoft.com",
  salt: "$2a$10$eRf9d1ZCwmrnbbLv1ZKB5u",
  password: "$2a$10$eRf9d1ZCwmrnbbLv1ZKB5uLboiNk89fmLzgTdEc4tQIvSJvWXLSiu",
  isAdmin: true,
  status: "active"
});

db.users.insert({
  firstName: "admin",
  lastName: "user",
  email: "jose.ledezma@absquesoft.com",
  salt: "$2a$10$A.OrlfIBC3484Lowi/oIuu",
  password: "0ee80f4967927ee130f0e2ec642d7ece$2a$10$A.OrlfIBC3484Lowi/oIuu",
  image: "/assets/img/user_icon.png",
  countryCode: "CR",
  phoneNumber: "88432363",
  isAdmin: true,
  status: "confirmed"
});

//Ab$qu3so
