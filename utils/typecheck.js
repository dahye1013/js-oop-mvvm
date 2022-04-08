const type = (target, type) => {
  if (typeof type == 'string') {
    if (typeof target != type) throw `invalid ${target}: ${type}`;
  } else if (!(target instanceof type)) throw `invalid type ${target}: ${type}`;
  return target;
};

export { type };
