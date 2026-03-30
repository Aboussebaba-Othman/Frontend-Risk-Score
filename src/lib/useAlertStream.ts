import { useEffect } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import type { Alert } from '@/types';

export function useAlertStream() {
    const token = useAuthStore(state => state.token);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!token) return;

        const ctrl = new AbortController();
        
        const connectStream = async () => {
            await fetchEventSource('/api/v1/alerts/stream', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'text/event-stream'
                },
                signal: ctrl.signal,
                async onopen(response) {
                    if (response.ok) {
                        console.log('SSE Alert stream opened');
                        queryClient.invalidateQueries({ queryKey: ['alerts'] });
                        return; 
                    } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
                        throw new Error(`Fatal error ${response.status}`);
                    }
                },
                onmessage(ev) {
                    console.log('SSE Received event:', ev.event);
                    if (ev.event === 'NEW_ALERT') {
                        try {
                            const newAlert: Alert = JSON.parse(ev.data);
                            console.log('Parsed NEW_ALERT:', newAlert.id);
                            let wasAdded = false;
                            
                            queryClient.setQueryData<Alert[]>(['alerts'], (old) => {
                                const currentAlerts = old || [];
                                if (currentAlerts.some(a => a.id === newAlert.id)) {
                                    return currentAlerts;
                                }
                                wasAdded = true;
                                return [newAlert, ...currentAlerts];
                            });

                                if (wasAdded) {
                                    try {
                                        console.log('Playing alert sound...');
                                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                                        audio.volume = 0.5;
                                        
                                        audio.play().catch(e => {
                                            console.warn('Audio auto-play blocked or failed:', e.message);
                                        });

                                        setTimeout(() => {
                                            if (audio.paused) {
                                               console.log('Retrying audio playback...');
                                               audio.play().catch(() => {});
                                            }
                                        }, 1000);
                                    } catch (e) {
                                        console.error('Failed to play audio', e);
                                    }
                                }
                            } catch (err) {
                            console.error('Failed to parse NEW_ALERT', err);
                        }
                    } else if (ev.event === 'INIT') {
                        console.log('SSE Stream Initialized:', ev.data);
                    }
                },
                onclose() {
                    console.log('SSE Alert stream closed by server');
                },
                onerror(err) {
                    console.error('SSE Alert stream error', err);
                }
            });
        };

        connectStream().catch(err => console.error('Error connecting to SSE stream:', err));

        return () => {
            ctrl.abort(); 
        };
    }, [token, queryClient]);
}
