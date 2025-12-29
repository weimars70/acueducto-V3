import { onMounted, onUnmounted } from 'vue';
import { API_URL } from '../config/environment';

export function useConsumptionRealtime(onUpdate: () => void) {
  let eventSource: EventSource | null = null;

  const setupSSE = () => {
    if (eventSource) {
      eventSource.close();
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    // Send token as query param for SSE (EventSource doesn't support headers)
    eventSource = new EventSource(`${API_URL}/consumo/events?token=${token}`, {
      withCredentials: true
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📡 SSE Received:', data);
        if (data.type === 'consumo_update') {
          onUpdate();
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = () => {
      // Reconectar si se cierra la conexión
      if (eventSource?.readyState === EventSource.CLOSED) {
        eventSource?.close();
        setTimeout(setupSSE, 5000);
      }
    };
  };

  onMounted(() => {
    setupSSE();
  });

  onUnmounted(() => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  });
}