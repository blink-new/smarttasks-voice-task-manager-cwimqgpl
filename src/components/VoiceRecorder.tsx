import { useState, useRef, useEffect } from 'react'
import { blink } from '../blink/client'
import { useLanguage } from '../contexts/LanguageContext'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Mic, MicOff, Square, X, Loader2 } from 'lucide-react'

interface VoiceRecorderProps {
  onClose: () => void
}

export function VoiceRecorder({ onClose }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [audioLevel, setAudioLevel] = useState(0)
  const [user, setUser] = useState<any>(null)
  const { t, language, isRTL } = useLanguage()
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const createTaskFromTranscript = async (text: string) => {
    try {
      // Use AI to parse the voice command and extract task details
      const { object: taskData } = await blink.ai.generateObject({
        prompt: `Parse this voice command into a task: "${text}". Extract the title, priority (high/medium/low), category (work/personal/study/home), and any due date mentioned.`,
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            priority: { type: 'string', enum: ['high', 'medium', 'low'] },
            category: { type: 'string', enum: ['work', 'personal', 'study', 'home'] },
            dueDate: { type: 'string' },
            description: { type: 'string' }
          },
          required: ['title']
        }
      })

      // Create the task in the database
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await blink.db.tasks.create({
        id: taskId,
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        category: taskData.category || 'personal',
        completed: 0,
        dueDate: taskData.dueDate || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.id
      })

      // Close the recorder after successful task creation
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    if (!user?.id) return
    
    setIsProcessing(true)
    
    try {
      // Convert audio to base64
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const dataUrl = reader.result as string
          const base64Data = dataUrl.split(',')[1]
          resolve(base64Data)
        }
        reader.onerror = reject
        reader.readAsDataURL(audioBlob)
      })

      // Transcribe audio
      const { text } = await blink.ai.transcribeAudio({
        audio: base64Audio,
        language: language
      })

      setTranscript(text)

      // Process the transcript to create a task
      if (text.trim()) {
        await createTaskFromTranscript(text)
      }
    } catch (error) {
      console.error('Error processing audio:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await processAudio(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      
      // Start audio level monitoring
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      
      microphone.connect(analyser)
      analyser.fftSize = 256
      
      const updateAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        setAudioLevel(average)
        
        if (isRecording) {
          animationRef.current = requestAnimationFrame(updateAudioLevel)
        }
      }
      
      updateAudioLevel()
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setAudioLevel(0)
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
            <Mic className="w-5 h-5 text-primary" />
            <span>{t('voiceCommand')}</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Recording Visualization */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-20 h-20 rounded-full ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-primary hover:bg-primary/90'
                }`}
                size="icon"
              >
                {isProcessing ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : isRecording ? (
                  <Square className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
              
              {/* Audio level visualization */}
              {isRecording && (
                <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-pulse"
                     style={{
                       transform: `scale(${1 + audioLevel / 100})`,
                       opacity: 0.6
                     }}
                />
              )}
            </div>
            
            <div className="text-center">
              {isProcessing ? (
                <div className="space-y-2">
                  <Badge variant="secondary">{t('processing')}</Badge>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'جاري تحويل الكلام إلى مهمة' : 'Converting speech to task'}
                  </p>
                </div>
              ) : isRecording ? (
                <div className="space-y-2">
                  <Badge className="bg-red-500">{t('listening')}</Badge>
                  <p className="text-sm text-muted-foreground">
                    {t('speakNow')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Badge variant="outline">{language === 'ar' ? 'جاهز' : 'Ready'}</Badge>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'اضغط لبدء التسجيل' : 'Tap to start recording'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="space-y-2">
              <h4 className="font-medium">{language === 'ar' ? 'النص المكتوب:' : 'Transcript:'}</h4>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{transcript}</p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">{t('voiceExamples')}</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• {t('example1')}</p>
              <p>• {t('example2')}</p>
              <p>• {t('example3')}</p>
              <p>• {t('example4')}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`flex ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
            <Button variant="outline" onClick={onClose} className="flex-1">
              {t('cancel')}
            </Button>
            {!isRecording && !isProcessing && (
              <Button onClick={startRecording} className="flex-1">
                <Mic className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {language === 'ar' ? 'ابدأ التسجيل' : 'Start Recording'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}