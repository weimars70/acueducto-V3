import { ref } from 'vue';
import { useQuasar } from 'quasar';

export type VoiceInputStatus = 'idle' | 'listening' | 'processing' | 'success' | 'error';

export type VoiceCommand =
  | { type: 'month', value: string }
  | { type: 'code', value: string }
  | { type: 'reading', value: string }
  | { type: 'save' }
  | { type: 'cancel' }
  | { type: 'unknown' };

export function useVoiceInput() {
  const $q = useQuasar();
  const status = ref<VoiceInputStatus>('idle');
  const transcript = ref('');
  const isSupported = ref(false);
  const isListening = ref(false);

  // Check if browser supports Speech Recognition
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  isSupported.value = !!SpeechRecognition;

  let recognition: any = null;
  let commandCallback: ((command: VoiceCommand) => void) | null = null;

  if (isSupported.value) {
    recognition = new SpeechRecognition();
    recognition.continuous = true; // Cambiar a continuo
    recognition.interimResults = false;
    recognition.lang = 'es-CO'; // Spanish Colombia
  }

  /**
   * Parse voice command from transcript
   */
  const parseCommand = (text: string): VoiceCommand => {
    const processed = text.toLowerCase().trim();
    console.log('Comando de voz recibido:', processed);

    // Extraer números del texto
    const extractNumbers = (str: string): string => {
      // Primero intentar extraer dígitos directos
      const digits = str.replace(/\D/g, '');
      if (digits) return digits;

      // Convertir palabras numéricas a dígitos
      const numberMap: { [key: string]: string } = {
        'cero': '0', 'uno': '1', 'dos': '2', 'tres': '3', 'cuatro': '4',
        'cinco': '5', 'seis': '6', 'siete': '7', 'ocho': '8', 'nueve': '9'
      };

      for (const [word, digit] of Object.entries(numberMap)) {
        if (str.includes(word)) {
          return digit;
        }
      }

      return '';
    };

    // Comando: código
    if (processed.includes('código') || processed.includes('codigo')) {
      const numbers = extractNumbers(processed);
      if (numbers) {
        return { type: 'code', value: numbers };
      }
    }

    // Comando: lectura
    if (processed.includes('lectura')) {
      const numbers = extractNumbers(processed);
      if (numbers) {
        return { type: 'reading', value: numbers };
      }
    }

    // Comando: mes
    if (processed.includes('mes')) {
      const monthMap: { [key: string]: string } = {
        'enero': 'enero',
        'febrero': 'febrero',
        'marzo': 'marzo',
        'abril': 'abril',
        'mayo': 'mayo',
        'junio': 'junio',
        'julio': 'julio',
        'agosto': 'agosto',
        'septiembre': 'septiembre',
        'setiembre': 'septiembre',
        'octubre': 'octubre',
        'noviembre': 'noviembre',
        'diciembre': 'diciembre'
      };

      for (const [key, month] of Object.entries(monthMap)) {
        if (processed.includes(key)) {
          return { type: 'month', value: month };
        }
      }
    }

    // Comando: guardar
    if (processed.includes('guardar') || processed.includes('grabar')) {
      return { type: 'save' };
    }

    // Comando: cancelar
    if (processed.includes('cancelar')) {
      return { type: 'cancel' };
    }

    return { type: 'unknown' };
  };

  /**
   * Start continuous listening for voice commands
   */
  const startListening = (onCommand: (command: VoiceCommand) => void) => {
    if (!isSupported.value) {
      $q.notify({
        type: 'negative',
        message: 'Reconocimiento de voz no soportado en este navegador',
        position: 'top'
      });
      return;
    }

    if (isListening.value) {
      return;
    }

    commandCallback = onCommand;
    status.value = 'listening';
    isListening.value = true;

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      transcript.value = text;

      status.value = 'processing';

      const command = parseCommand(text);

      if (command.type !== 'unknown') {
        status.value = 'success';
        if (commandCallback) {
          commandCallback(command);
        }

        setTimeout(() => {
          status.value = 'listening';
        }, 1000);
      } else {
        status.value = 'listening';
        $q.notify({
          type: 'warning',
          message: `Comando no reconocido: "${text}"`,
          position: 'top',
          timeout: 2000
        });
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);

      // Ignorar errores de "no-speech" en modo continuo
      if (event.error === 'no-speech') {
        return;
      }

      let errorMessage = 'Error en el reconocimiento de voz';

      if (event.error === 'audio-capture') {
        errorMessage = 'No se pudo acceder al micrófono';
        stopListening();
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Permiso de micrófono denegado';
        stopListening();
      }

      $q.notify({
        type: 'negative',
        message: errorMessage,
        position: 'top'
      });
    };

    recognition.onend = () => {
      // Si todavía estamos en modo listening, reiniciar
      if (isListening.value) {
        try {
          recognition.start();
        } catch (error) {
          console.error('Error restarting recognition:', error);
        }
      }
    };

    try {
      recognition.start();
      $q.notify({
        type: 'info',
        message: 'Escuchando comandos de voz... Di "código", "lectura" o "guardar"',
        position: 'top',
        timeout: 3000
      });
    } catch (error) {
      console.error('Error starting recognition:', error);
      isListening.value = false;
      status.value = 'idle';
    }
  };

  /**
   * Stop listening
   */
  const stopListening = () => {
    if (recognition && isListening.value) {
      isListening.value = false;
      recognition.stop();
      status.value = 'idle';
      commandCallback = null;

      $q.notify({
        type: 'info',
        message: 'Reconocimiento de voz detenido',
        position: 'top',
        timeout: 1500
      });
    }
  };

  /**
   * Toggle listening on/off
   */
  const toggleListening = (onCommand?: (command: VoiceCommand) => void) => {
    if (isListening.value) {
      stopListening();
    } else if (onCommand) {
      startListening(onCommand);
    }
  };

  return {
    status,
    transcript,
    isSupported,
    isListening,
    startListening,
    stopListening,
    toggleListening
  };
}
