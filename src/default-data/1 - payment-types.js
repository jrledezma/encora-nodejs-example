// payment type
db.paymenttypes.insert({
  _id: 'sinpe',
  value: 'SINPE móvil',
  description:
    'Pago por medio de transferencia desde un celular y enviando un mensaje SMS',
  isActive: true
});
db.paymenttypes.insert({
  _id: 'transf',
  value: 'Transferencia Eléctronica',
  description:
    'Transferencia directa desde la cuenta del cliente a una cuenta bancaria propia',
  isActive: true
});
db.paymenttypes.insert({
  _id: 'cash',
  value: 'Efectivo',
  description: 'Pago en efectivo',
  isActive: true
});
