import Component from '@ember/component';

import { alias, notEmpty } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';

import Constants from 'romgerebox/constants';

export default Component.extend({

  audioService : service('audio'),

  classNames: ['boxTrack', 'layout-col', 'flex-nogrow'],

  classNameBindings: ['sampleColor', 'dragPending','hasSample'],
  sampleColor: alias('sample.color'),
  sampleIcon: alias('sample.icon'),
  hasSample: notEmpty('sample'),


  //Sample to play
  sample: null,

  dragPending: false,

  mute: false,
  solo: false,

  volume : Constants.INITIAL_TRACK_VOLUME,

  //Register to parent
  didReceiveAttrs() {
    this.get('boxMain').registerBoxTrack( this);
  },


  clearCurrentSample: function(){
    let sample = this.get('sample')
    this.set('sample', null);

    this.get('boxMain').sampleChangedForTrack( this, null);

    sample.set('isUsed', false);
    sample.get('file_a').pause();
    let file_b = sample.get('file_b');
    if( file_b ){
      file_b.pause();
    }

    this.get('boxMain').endSoloForTrack();
    this.set('solo', false);
    this.setMuteState( false);
  },

  setMuteState: function( mute ){
      if( isEmpty(this.get('sample'))){
        return;
      }

      this.get('sample').setVolume( mute ? 0 : (this.get('volume') / 100));

      this.set('mute', mute ? true : false);
      this.set('solo', false);
  },

  setSample: function( sample){

    if( this.get('sample') ){
      this.clearCurrentSample();
    }

    this.set('sample', sample);
    this.get('boxMain').sampleChangedForTrack( this, sample);
    
    sample.set('isUsed', true);
  },

  actions:{
    play: function( params ){

      if( isEmpty(this.get('sample'))){
        return;
      }

      let file_a = this.get('sample.file_a');
      let file_b = this.get('sample.file_b');
      file_a.currentTime = 0;
      if( file_b ){
        file_b.currentTime = 0;
      }

      if( params.isLoopSideA || ! file_b ){
        file_a.play();
        if( file_b ){
          file_b.pause();
        }
      }
      else{
        file_b.play();
        file_a.pause();
      }
    },

    stop: function(){

      if( isEmpty(this.get('sample'))){
        return;
      }

      let file_a = this.get('sample.file_a');
      let file_b = this.get('sample.file_b');

      file_a.pause();
      if( file_b ){
        file_b.pause();
      }
    },

    sync: function( params ){

      if( isEmpty(this.get('sample'))){
        return;
      }

      let file_a = this.get('sample.file_a');
      let file_b = this.get('sample.file_b');
      file_a.currentTime = 0;
      if( file_b ){
        file_b.currentTime = 0;
      }


      if( params.isLoopSideA || ! file_b ){
        file_a.play();
        if( file_b ){
          file_b.pause();
        }
      }
      else{
        file_b.play();
        file_a.pause();
      }
    },

    onDragSample: function( sample ){
      this.setSample( sample);
    },

    onOverAction: function(){
      this.set('dragPending', true);
    },

    onDragOutAction: function(){
      this.set('dragPending', false);
    },

    muteToggle: function(){
      this.setMuteState( ! this.get('mute'));
    },

    soloAction: function(){

      if( this.get('solo') ){
        this.get('boxMain').endSoloForTrack();
        this.set('solo', false);
        this.setMuteState( false);
      }
      else{
        this.setMuteState( false);
        this.get('boxMain').askForSoloForTrack( this);
        this.set('solo', true);
      }
    },

    //Mute from parent (for other track solo)
    mute: function( mute){
      this.setMuteState( mute);
    },


    removeAction: function(){
      this.clearCurrentSample();
    },

    setVolume: function( volume ){
      this.set('volume', volume);
      this.get('sample').setVolume( volume / 100);
    },

  }
});
