// Called by the scheduled sender after checking account preferences and eligibility.
// Pure template: importing this module never sends mail.
export function rouletteReminder({hasStarted=false,lastSaturday=null,unsubscribeUrl}) {
  const url=new URL(unsubscribeUrl);
  if(url.protocol!=='https:')throw new Error('HTTPS_UNSUBSCRIBE_REQUIRED');
  const subject='Es sábado: tienes una tirada gratis en PostisPop';
  const introduction=hasStarted
    ? `Tu tirada gratuita de este sábado te espera.${lastSaturday ? ` Tu último sábado disponible es ${lastSaturday}.` : ''}`
    : 'Descubre la ruleta gratuita del sábado. Tu plazo comienza cuando hagas tu primera tirada, no al recibir este correo.';
  const text=`${introduction}\n\nPuedes ganar una pizarra que aún no tengas y, entre los premios, Premium de por vida. Cada tirada tiene una posibilidad entre seis de ganar.\n\nAbrir la ruleta: https://postispop.com/atelier.html#premios\n\nUna tirada gratuita por cuenta y sábado. Desde tu primera tirada tendrás diez sábados disponibles, contando el primero.\n\nDejar de recibir estos recordatorios: ${url.href}`;
  return {subject,text};
}
