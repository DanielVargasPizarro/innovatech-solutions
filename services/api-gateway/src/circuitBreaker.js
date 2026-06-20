const CircuitBreaker = require('opossum')
const axios = require('axios')

// Opciones del circuit breaker
const breakerOptions = {
  timeout: 5000,           // Si tarda más de 5s, falla
  errorThresholdPercentage: 50, // Si 50% de las llamadas fallan, abre el circuito
  resetTimeout: 10000,     // Intenta recuperarse después de 10s
}

// Función base para hacer requests HTTP
const httpRequest = async ({ method, url, data, headers }) => {
  const response = await axios({ method, url, data, headers })
  return response.data
}

// Circuit breaker por servicio
const createBreaker = (serviceName) => {
  const breaker = new CircuitBreaker(httpRequest, breakerOptions)

  breaker.on('open', () =>
    console.warn(`⚠️  Circuito ABIERTO para ${serviceName} — servicio no disponible`)
  )
  breaker.on('halfOpen', () =>
    console.info(`🔄  Circuito MEDIO-ABIERTO para ${serviceName} — probando recuperación`)
  )
  breaker.on('close', () =>
    console.info(`✅  Circuito CERRADO para ${serviceName} — servicio recuperado`)
  )

  return breaker
}

const breakers = {
  proyectos: createBreaker('ms-proyectos'),
  recursos: createBreaker('ms-recursos'),
  analitica: createBreaker('ms-analitica'),
}

module.exports = { breakers }
