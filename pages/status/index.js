import useSWR from 'swr'

async function fetchAPI(key) {
  const response = await fetch(key)
  const responseBody = await response.json()
  return responseBody
}

export default function StatusPage() {
  return (
    <>
      <h1>Status Page</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  )
}

function UpdatedAt() {
  const { isLoading, data } = useSWR('/api/v1/status', fetchAPI, {
    refreshInterval: 2000,
  })

  let updatedAtValue = 'Loading...'
  if (!isLoading && data) {
    updatedAtValue = new Date(data.updated_at).toLocaleString('pt-BR')
  }

  return <p>Última atualização: {updatedAtValue}</p>
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR('/api/v1/status', fetchAPI, {
    refreshInterval: 2000,
  })

  let databaseInfo = ''
  let maxConnectionsValue = '??'
  let openedConnectionsValue = '??'
  let databaseVersionValue = '??'

  if (!isLoading && data.dependencies.database) {
    databaseInfo = data.dependencies.database

    maxConnectionsValue = databaseInfo.max_connections
    openedConnectionsValue = databaseInfo.opened_connections
    databaseVersionValue = databaseInfo.version
  }

  return (
    <div>
      <h2>Database</h2>
      &nbsp;&nbsp;Máximo de Conexões: {maxConnectionsValue}
      <br />
      &nbsp;&nbsp;Conexões Abertas: {openedConnectionsValue}
      <br />
      &nbsp;&nbsp;Versão: {databaseVersionValue}
    </div>
  )
}
