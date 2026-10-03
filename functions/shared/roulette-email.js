// Called by the scheduled sender after checking account preferences and eligibility.
// Pure template: importing this module never sends mail.
export function rouletteReminder({hasStarted=false,winDenominator=6,unsubscribeUrl}) {
  const url=new URL(unsubscribeUrl);
  if(url.protocol!=='https:')throw new Error('HTTPS_UNSUBSCRIBE_REQUIRED');
  if(![6,10].includes(winDenominator))throw new Error('INVALID_ODDS');
  const subject='Es sábado: tienes una tirada gratis en PostisPop';
  const introduction=hasStarted
    ? 'Tu tirada gratuita de este sábado te espera.'
    : 'Descubre la ruleta gratuita del sábado. Tu plazo comienza cuando hagas tu primera tirada, no al recibir este correo.';
  const text=`${introduction}\n\nPuedes ganar una pizarra que aún no tengas y, entre los premios, Premium de por vida. Tu probabilidad actual de ganar es 1 entre ${winDenominator}. La posibilidad conjunta de una tarjeta de 100 € es 1 entre 8.000.000.000 por tirada.\n\nAbrir la ruleta: https://postispop.com/atelier.html#premios\n\nUna tirada gratuita por cuenta y sábado. Los primeros seis sábados desde tu primera tirada: 1 entre 6. Desde el séptimo: 1 entre 10, sin fecha de fin, incluyendo países.\n\nDejar de recibir estos recordatorios: ${url.href}`;
  return {subject,text};
}
