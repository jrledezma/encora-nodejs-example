//
db.projectstatus.insert({
  _id: '0001',
  value: 'Recibida',
  description: 'La orden ha sido recibida',
  isActive: true
});

//
db.projectstatus.insert({
  _id: '0002',
  value: 'Creacion de Documento de Requerimientos',
  description: 'El proyecto se encuentra en analisis de requerimientos',
  isActive: true
});
//
db.projectstatus.insert({
  _id: '0003',
  value: 'Documento de Requerimientos Entregado',
  description:
    'El documento de requerimientos ha sido entregada y esta a la espera de la aprobacion de cliente',
  isActive: true
});

//
db.projectstatus.insert({
  _id: '0004',
  value: 'Creacion de Cotizacion',
  description: 'Analisis de costos y creacion de cotizacion',
  isActive: true
});

//
db.projectstatus.insert({
  _id: '0005',
  value: 'Cotizacion Entrega',
  description:
    'La Cotizacion ha sido entregada y se encuentra a la espera de aprobacion',
  isActive: true
});

db.projectstatus.insert({
  _id: '0006',
  value: 'Espera de Orden de Compra',
  description:
    'El cliente ha aceptado la cotizacion y se espera la orden de compra',
  isActive: true
});

db.projectstatus.insert({
  _id: '0007',
  value: 'Proyecto en Desarrollo',
  description: 'El proyecto se encuentra en desarrollo',
  isActive: true
});

db.projectstatus.insert({
  _id: '0008',
  value: 'Testing Final de Desarrollo',
  description: 'El proyecto se encuentra en fase de pruebas de desarrollo',
  isActive: true
});

db.projectstatus.insert({
  _id: '0009',
  value: 'Implemantacion en Ambiente Pre-Productivo',
  description: 'El proyecto se implementa en ambiente pre-productivo',
  isActive: true
});

db.projectstatus.insert({
  _id: '0010',
  value: 'Testing Ambiente Pre-Productivo',
  description:
    'El proyecto se encuentra en fase de pruebas en ambiente pre-productivo',
  isActive: true
});

db.projectstatus.insert({
  _id: '0011',
  value: 'Implemantacion Ambiente Productivo',
  description: 'El proyecto se implementa en ambiente productivo',
  isActive: true
});

db.projectstatus.insert({
  _id: '0012',
  value: 'Pruebas Ambiente Productivo por Parte de Cliente',
  description:
    'El proyecto se encuentra en fase de pruebas en ambiente productivo por parte de cliente',
  isActive: true
});

db.projectstatus.insert({
  _id: '0013',
  value: 'Charla Introductorias',
  description: 'Se entrega documentacion y se dan charlas demostrativas',
  isActive: true
});

db.projectstatus.insert({
  _id: '0014',
  value: 'Proyecto Entregado',
  description: 'El proyecto ha sido finalizado y entregado',
  isActive: true
});

db.projectstatus.insert({
  _id: '0015',
  value: 'Cliente Cancela Proyecto',
  description: 'El cliente decide dar por finalizado el proyecto o contrato',
  isActive: true
});

db.projectstatus.insert({
  _id: '0016',
  value: 'Proyecto Cancelado',
  description: 'El proyecto o contrato ha sido cancelado',
  isActive: true
});

db.projectstatus.insert({
  _id: '0017',
  value: 'Proyecto no Aceptado',
  description: 'El cliente no ha aceptado el proyecto',
  isActive: true
});

db.projectstatus.insert({
  _id: '0018',
  value: 'Cotizacion no Aceptada',
  description: 'El cliente no ha aceptado los terminos de la Cotizacion',
  isActive: true
});
