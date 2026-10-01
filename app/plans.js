// Proposed recurring plans are data, not an active offer or client entitlement.
export const PROPOSED_PLANS = Object.freeze({monthly:{currency:'eur',amount:299,interval:'month'},yearly:{currency:'eur',amount:2499,interval:'year'}});
export const LIFETIME_PRODUCTS = ['pack-rebel','pack-minimal','reloj-recordatorios','postispop-pro'];
export function entitlements(access, now=Date.now()) {
  const products=new Set(access?.products||[]),pack=products.has('postispop-pro');
  const subscription=access?.subscription;
  const subscribed=Boolean(subscription&&['active','trialing'].includes(subscription.status)&&Date.parse(subscription.current_period_end)>now);
  return { rebel:pack||subscribed||products.has('pack-rebel'),minimal:pack||subscribed||products.has('pack-minimal'),clock:pack||subscribed||products.has('reloj-recordatorios')||Boolean(access?.clock_active&&Date.parse(access.trial_expires_at)>now), subscription:subscribed, legacyPack:pack };
}
