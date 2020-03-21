import React from 'react';
import ReactDOM from 'react-dom';
import whiteChecker from './images/whiteChecker.png';
import blackChecker from './images/blackChecker.png';
import nothing from './images/nothing.png'
import whiteKing from './images/whiteCheckerKing.png'
import blackKing from './images/blackCheckerKing.png'
import './index.css';

  class Board extends React.Component {

    constructor(props) {
        super(props)
        this.state = {  
            blackWalks: 0,
            pressedSquare: [null,[]],
            positonOfCheckers: this.props.firstPosition,
            before: [],
        }
    }
    
    onPressedChecker = (coord, array, switchPosition, bot) => {
      let clearCells = []
      const curCheck = this.state.positonOfCheckers[array.indexOf(+coord)]
      console.log(coord);
      if(!switchPosition) {
        if(AllWaysAndMostWay(this.state.positonOfCheckers, 0).all.length){
          let curCheck = AllWaysAndMostWay(this.state.positonOfCheckers, 0).all.map(el => el[1]).indexOf(+coord)
          if(curCheck != -1) {
            this.killCheckersAlg(this.state.positonOfCheckers, 0, AllWaysAndMostWay(this.state.positonOfCheckers, 0).all[curCheck])
          }
        } else if(curCheck[1] == this.state.blackWalks) {  
            const wayWithQuin = enemyCheckersSearchQuin(+coord, this.state.positonOfCheckers, curCheck[1]) 
            clearCells = curCheck[2] ? 
              clearCells.concat(curCheck[1] === 1 ? 
                [array.includes(+coord + 11) ? null : +coord + 11 , array.includes(+coord + 9) ? null : +coord + 9] : 
                [array.includes(+coord - 11) ? null : +coord - 11 ,array.includes(+coord - 9) ? null : +coord - 9]) : 
              wayWithQuin.canBeat.length ? wayWithQuin.canBeat : wayWithQuin.canGo
        } 
      }
      if(switchPosition){
        this.state.positonOfCheckers = this.positionSwitcher(coord, array)
        this.botAlg(this.state.positonOfCheckers)
      }
      this.setState({
        pressedSquare: switchPosition ? [null, []] : [+coord, clearCells],
      })
    }

    positionSwitcher = (coord, array, helpEl) => {
      const curCheck = this.state.positonOfCheckers[array.indexOf(this.state.pressedSquare[0])]  
      let copyArray = this.state.positonOfCheckers.map(el => el)
      if(!curCheck[2]) {
        const ways = enemyCheckersSearchQuin(this.state.pressedSquare[0], this.state.positonOfCheckers, curCheck[1])
        const mustGo = ways.canBeat.map(el => el.go)
        if(mustGo.includes(helpEl)) {
          copyArray.splice(array.indexOf(ways.canBeat[mustGo.indexOf(helpEl)].kill), 1)
          array.splice(array.indexOf(ways.canBeat[mustGo.indexOf(helpEl)].kill),1)
        }
      } else {
        if((+coord - this.state.pressedSquare[0]) % 2 == 0){
          copyArray.splice(array.indexOf(this.state.pressedSquare[0] + (+coord - this.state.pressedSquare[0]) / 2),1)
          array.splice(array.indexOf(this.state.pressedSquare[0] + (+coord - this.state.pressedSquare[0]) / 2),1)
        }
        if(curCheck[1] == 0) {
          coord <= 8 ?   copyArray[array.indexOf(this.state.pressedSquare[0])][2] = false : console.log()
        } else {
          coord >= 70 ?   copyArray[array.indexOf(this.state.pressedSquare[0])][2] = false : console.log();
        }
      }     

      copyArray.push([
        +coord, copyArray[array.indexOf(this.state.pressedSquare[0])][1],
        copyArray[array.indexOf(this.state.pressedSquare[0])][2]
      ])

      copyArray.splice(array.indexOf(this.state.pressedSquare[0]),1)

      return copyArray
    }

    botAlg = (array) => { 
      if (!this.killCheckersAlg(array, 1)) {
        
      }
    }
    
    killCheckersAlg = (array, typeOfChecker, curCheck) => {
      let mostProfitWay = curCheck
      if (!curCheck) {
        const ways = AllWaysAndMostWay(array, typeOfChecker, true)
        mostProfitWay = ways.mostForBot.length ?  ways.mostForBot : ways.most
      }
      mostProfitWay.length ? mostProfitWay[0].mustGo.forEach((el, i) => {
        ((ind) => {
          setTimeout(() => {
            const nextElMost = mostProfitWay[0].mustGo[i+1]
            this.state.pressedSquare = [mostProfitWay[1], []]
            const nextEl = nextElMost ?  nextElMost.kill - (nextElMost.go - nextElMost.kill) : mostProfitWay[0].curCheck
            this.state.positonOfCheckers = this.positionSwitcher(nextEl, getPos(this.state.positonOfCheckers), el.go)
            mostProfitWay[1] = nextEl
            this.setState({
              pressedSquare: this.state.pressedSquare
            })
          }, 500 + (500 * ind));
        })(i);
      }) : console.log(null);
      //   ways[i] = [el, 1, copyArray, [+el], check]
      return mostProfitWay.length
    }

    renderSquare(i, j, currentI) {
      return <Square i = {i}
                     j = {j}
                     onPressedChecker = {this.onPressedChecker}
                     currentI = {currentI}
                     pressedSquare = {this.state.pressedSquare}
                     position = {this.state.positonOfCheckers}/>;
    }

    render() {
        let status = 'Ходят: ' + (this.state.blackWalks == 0 ? 'белые': 'чёрные');
        const createRow = index => (
          <div className = "board-row" key={index}>
            {Array(8).fill(0).map((v, i) => this.renderSquare(i, index, index * 10 + i))}
          </div>
        )
        return (
          <div>
            <div className="status">{status}</div>
              {Array(8).fill(0).map((v, i) => createRow(i))}
              <button  onClick = {() => this.setState({positonOfCheckers: this.state.before})}>{'Назад'}</button>
          </div>
        );
    } 

  }

  function AllWaysAndMostWay (array, typeOfChecker, bot) {       
    const justOneType = []
    array.forEach(el => el[1] == typeOfChecker ? justOneType.push(el[0]) : null)
    const allWays = []
    justOneType.forEach(el => {
      if(typeof theMostProfitWay(el, array).el == 'object') {
        allWays.push([theMostProfitWay(el, array).el, el])
      }
    })
    let wayWithoutDed = [];
    const most = allWays.sort((a, b) => b[0].mustGo.length - a[0].mustGo.length)[0]
    if(bot && most) {
      const theMostArray = randomCoordsAr(theMostProfitWay(most[1], array).allMostEl)
      let index =  theMostArray.map(el => canBeat (el.curCheck, el.copyArray)).indexOf(false)
      if(index != -1) { 
        wayWithoutDed = [theMostArray[index],theMostArray[index].startEl]
      }
    }
    console.log();
    return {
      most: allWays.length ? most : [],
      all: allWays,
      mostForBot: wayWithoutDed,
    }
  }

  function theMostProfitWay (check, array) { // array - array of checkers position; check - check position
    const curCheck = array[getPos(array).indexOf(+check)]
    const completed = curCheck[2] ? noralCheck(check, array, curCheck) : quinCheck(check, array, curCheck)
    const mostEl =  completed.sort((a, b) => b.mustGo.length - a.mustGo.length)[0]
    const allMostEl = [];
    if(mostEl) {
      completed.forEach(el => {
        if(el.mustGo.length == mostEl.mustGo.length) {
          allMostEl.push(el)
        }
      })
    }
    return {
      el: mostEl,
      allMostEl : allMostEl
    };
  } 

  function enemyCheckersSearchQuin (check, array, typeOfChecker, lastKill) { // array - array of checkers position; check - check position
    const canBeat = []
    const canGo = []  
    randomCoordsAr().forEach(el => {
      for (let i = 1; verif(check + el * i); i++) {
        if(!lastKill || -lastKill != el){
          if(getPos(array).includes(check + el * i)) {
            if( !getPos(array).includes(check + el * (i + 1)) && verif(check + el * (i + 1)) 
            && array[getPos(array).indexOf(check + el * i)][1] !== typeOfChecker) {
              canBeat.push({
                kill: check + el * i,
                go: check + el * (i + 1)
              })
            }
            break
          } else if(verif(check + el * i) ){
            canGo.push(check + el * i)
          }
        }
      }
    })
    return {
      canGo: canGo,
      canBeat: canBeat
    }
  }

  function quinCheck (check, array, curCheck) {
    const ways = []   
    const completed = []
    enemyCheckersSearchQuin(check, array, curCheck[1]).canBeat.forEach(el => {
      const copyArray = copy(array)
      copyArray.splice(getPos(array).indexOf(+check), 1)
      copyArray.splice(getPos(copyArray).indexOf(el.kill), 1)
      ways.push(
       {
        curCheck: el.go,
        copyArray: copyArray,
        mustGo: [el],
        startEl: check, 
       })
    })
    for (let i = 0; i < array.length; i++) {
      ways.forEach(e => {
        const curEl = e.curCheck - e.mustGo[e.mustGo.length-1].kill
        for (let j = 0; verif(e.curCheck + curEl * j); j++) {
          const index = e.curCheck + curEl * j
          if(!getPos(e.copyArray  ).includes(index) && verif(index)) {
            const canBeat = enemyCheckersSearchQuin(index, e.copyArray, curCheck[1], curEl).canBeat
            canBeat.forEach(el => {
              const copyArray = copy(e.copyArray) 
              copyArray.splice(getPos(e.copyArray)
                .indexOf(+el.kill), 1) 
              const tryToPush = {
                curCheck: el.go,
                copyArray: copyArray,
                mustGo: e.mustGo.concat([el]),
                startEl: e.startEl
              }     
              if(!equalEl(ways, tryToPush)) {
                ways.push(tryToPush)
                completed.push(tryToPush)
              }
            })
            const tryToPush = {
              curCheck: index,
              copyArray: copy(e.copyArray),
              mustGo: e.mustGo,
              startEl: e.startEl
            }     
            if(!equalEl(completed, tryToPush)) completed.push(tryToPush)
          } else {  
            break
          }
        }
      })
    }
    console.log(completed);
    
    return completed
  }

  function noralCheck (check, array, curCheck) {
    const ways = []   
    const completed = []
    enemyCheckersSearch(check, array, curCheck[1]).forEach(el => {
      const copyArray = array.map(el => el)
      copyArray.splice(getPos(array).indexOf(+check), 1)
      copyArray.splice(getPos(copyArray).indexOf(el.kill), 1)
      ways.push(
       {
        curCheck: el.go,
        copyArray: copyArray,
        mustGo: [el],
        startEl: check,
       })
    });
    for (let i = 0; i < array.length; i++) {
      ways.forEach((el, i) => {
        const canBeat = enemyCheckersSearch(el.curCheck, el.copyArray, curCheck[1])
        canBeat.forEach(e => {
          const copyArray = el.copyArray.map(el => el)
          copyArray.splice(getPos(el.copyArray)
            .indexOf(el.curCheck + (+e.go - el.curCheck) / 2), 1)
          ways.push(
            {
              curCheck: e.go,
              copyArray: copyArray,
              mustGo: el.mustGo.concat([e]),
              startEl: el.startEl
            }
          )
        })
        completed.push(el)
        delete ways[i]
      })
    }
    return completed
  }

  function copy(array) {
    return array.map(el => el)
  }

  function equalEl (array, el) {
    let equal = false
    for (let i = 0; i < array.length && !equal; i++) {
      if (array[i].startEl == el.startEl && array[i].curCheck == el.curCheck && array[i].mustGo.length == el.mustGo.length) {
        if (array[i].mustGo.map((e, i) => e.kill == el.mustGo[i].kill && e.go == el.mustGo[i].go).includes(true)) equal = true
      } 
    }
    return equal
  }

  function getPos (arrayOfPositions) {
    return arrayOfPositions.map(el => el[0])
  }

  function randomCoordsAr (array) {
    let willReturn = []
    while(array ? array.length != willReturn.length : willReturn.length != 4){
      const randomNumber = array ? array[Math.floor(Math.random() * array.length)] : [9, 11, -11, -9][Math.floor(Math.random() * 4)]
      if(!willReturn.includes(randomNumber)){
        willReturn.push(randomNumber)
      }
    }
    return willReturn
  }

  function enemyCheckersSearch (check, array, typeOfChecker) { // array - array of checkers position; check - check position
    const canBeat = []
    randomCoordsAr().forEach(el => {
      if(getPos(array).includes(+check + el)  && 
      !getPos(array).includes(+check + el+el) && 
      verif(+check + el + el)  && array[getPos(array).indexOf(+check + el)][1] !== typeOfChecker){
        canBeat.push({
          go: +check + el + el,
          kill: +check + el
        })
      }
    })
    return canBeat
  } 
  
  function  verif (el) {
    const secOfCoord = (el).toString()
    return secOfCoord[secOfCoord.length-1] < 8 && secOfCoord < 80 &&secOfCoord > -1
  }

  function canBeat (check, array) {
    let canBeat = false;
    array.push([check, 1, true])
    randomCoordsAr().forEach(el => {
      if (getPos(array).indexOf(check + el) != -1 && enemyCheckersSearch(check + el, array, 0).map(el => el.kill).indexOf(check) != -1 ) {
        canBeat = true
      }
    })
    return canBeat
  }

  class Square extends React.Component {
    render() {
        const arrayOfCoord = this.props.position.map(el => el[0])
        const current = this.props.currentI
        const classOfSquare = this.props.j % 2 === 0 ? this.props.i % 2 !== 0 ? 'squareBlack' :  
        'squareWhite' : this.props.i % 2 === 0 ? 'squareBlack' : 'squareWhite'
      return (
        <button className = {this.props.pressedSquare[0] === current ?  'choseSquare' : 
          this.props.pressedSquare[1].includes(current) ? 'canGo' : classOfSquare} 
        onClick = {() => arrayOfCoord.includes(current)  ? this.props.onPressedChecker(current.toString(), arrayOfCoord, false, false) : 
            this.props.pressedSquare[1].includes(current) ? this.props.onPressedChecker(current.toString(), arrayOfCoord, true, false) : console.log(current)}>
             {arrayOfCoord.includes(current) ?
             <img className= 'checker' src={
              this.props.position[arrayOfCoord.indexOf(current)][1] === 1 ? 
              this.props.position[arrayOfCoord.indexOf(current)][2] ? blackChecker : blackKing  : 
              this.props.position[arrayOfCoord.indexOf(current)][2] ? whiteChecker : whiteKing} alt='шашка' ></img> : 
             <img className= 'checker' src={nothing} alt='ничего'></img>
             }
        </button>
      );
    }
  } 

  class Game extends React.Component {
    render() { 
      const firstPosition = [[25, 0, false], [16, 1, false], [34, 1, false], [36, 1, false], [14, 1, false, ], [54, 1, false],,[56, 1, false],] 
      // const firstPosition = [] 
      // Array(2).fill(0).forEach((el, i) => {
      //   Array(3).fill(0).forEach((el, j) => {
      //       Array(8).fill(0).forEach((el, row) => {
      //           if(i === 0){
      //               if(j % 2 === 0) {
      //                   row % 2 === 0 ? firstPosition.push([+(''+ (5+j) + row), i, true]) : null;
      //               } else {
      //                   row % 2 !== 0 ? firstPosition.push([+(''+ (5+j) + row), i, true]) : null;
      //               }
      //           } else {
      //               if(j % 2 === 0) {
      //                   row % 2 !== 0 ? firstPosition.push([+(''+ j + row),i , true]) : null;
      //               } else {
      //                   row % 2 === 0 ? firstPosition.push([+(''+ j + row),i , true]) : null;
      //               }
      //           }
      //       }); 
      //   });  
      // }); 
      return (
        <div className="game">
          <div className="game-board">
            <Board firstPosition = {firstPosition}/>
          </div>  
          <div className="game-info">
            <div>{/* status */}</div>
          </div>
        </div>
      );
    }
  }
  
  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );
