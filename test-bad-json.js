const body = `{"username": "johndoe_2026", "password": "Password123!",}`;
fetch('http://localhost:4000/api/gateway/v1/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
}).then(r => Promise.all([r.status, r.text()]))
    .then(([s, t]) => console.log('STATUS:', s, 'BODY:', t))
    .catch(console.error);
