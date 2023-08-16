export let msg_play_audio = (audio_id: number) => postMessage([ETM_MSG_PLAY_SOUND, audio_id]);
export let msg_play_song = (song_id: number) => postMessage([ETM_MSG_PLAY_SONG, song_id]);
export let msg_stop_music = () => postMessage([ETM_MSG_STOP_MUSIC]);
export let msg_request_fullscreen = () => postMessage([ETM_MSG_REQUEST_FULLSCREEN]);
export let msg_save_options = (data: OptionsState) => postMessage([ETM_MSG_SAVE_OPTIONS, data]);