import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProvider } from '@/app/providers'

const queryClient = new QueryClient()

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AppProvider />
        </QueryClientProvider>
    )
}