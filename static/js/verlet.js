export function createVelocityVerlet(computeAcceleration) {
    return function step(state, dt) {
        const { u, v, a, aNext } = state;
        const n = u.length;

        for (let i = 0; i < n; i++) {
            u[i] += v[i] * dt + 0.5 * a[i] * dt * dt;
        }

        computeAcceleration(u, v, aNext);

        for (let i = 0; i < n; i++) {
            v[i] += 0.5 * (a[i] + aNext[i]) * dt;
            a[i] = aNext[i];
        }
    };
}