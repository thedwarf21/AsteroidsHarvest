class AH_AudioManager {
	
	/**
	 * Fonction lançant un son dans une balise audio créée à la volée
	 *
	 * @param      {string}  filename      Nom du fichier audio
	 * @param      {number}  lasting_time  Durée de vie de la balise audio (en fonction du son envoyé)
	 * @param      {boolean} is_music      Permet d'identifier effets sonores et musiques
	 */
	static playAudio(filename, lasting_time, is_music) {
		let can_play = is_music 
					 ? AH_MainController.scope.game.music_on 
					 : AH_MainController.scope.game.sound_fx_on;
		if (can_play) {
			let audio_player = document.createElement("AUDIO");
			audio_player.src = AUDIO_PATH + filename;
			document.body.appendChild(audio_player);
			audio_player.play().catch((error)=> { console.error(error); });

			// On retire la balise audio du DOM, dès lors qu'elle n'est plus utile
			if (!lasting_time)
				lasting_time = DEFAULT_AUDIO_LASTING_TIME;
			setTimeout(()=> audio_player.remove(), lasting_time);	
		}
	}

	/**
	 * Lance une musique d'ambiance, en boucle
	 *
	 * @param      {string}  filename  Le nom du fichier
	 */
	static startMusicLoop(filename) {
		if (AH_MainController.scope.game.music_on) {
			AH_AudioManager.stopMusicLoop();
			let audio_player = document.createElement("AUDIO");
			audio_player.src = AUDIO_PATH + filename;
			audio_player.loop = true;
			document.body.appendChild(audio_player);
			audio_player.play().catch((error)=> { console.error(error); });
			AH_MainController.scope.music_player = audio_player;
		}
	}

	/**
	 * Arrête la musique et supprime le lecteur du DOM
	 */
	static stopMusicLoop() {
		if (AH_MainController.scope.music_player) {
			AH_MainController.scope.music_player.pause();
			AH_MainController.scope.music_player.remove();
		}
	}
}