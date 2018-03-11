const position = [
  [['0', '0'], ['109px', '0'], ['218px', '0'], ['327px', '0']],
  [['0', '109px'], ['109px', '109px'], ['218px', '109px'], ['327px', '109px']],
  [['0', '218px'], ['109px', '218px'], ['218px', '218px'], ['327px', '218px']],
  [['0', '327px'], ['109px', '327px'], ['218px', '327px'], ['327px', '327px']],
];

function getNumberBackgroundColor(number) {
  switch (number) {
    case 2:
      return "#eee4da";
    case 4:
      return "#eee4da";
    case 8:
      return "#f26179";
    case 16:
      return "#f59563";
    case 32:
      return "#f67c5f";
    case 64:
      return "#f65e36";
    case 128:
      return "#edcf72";
    case 256:
      return "#edcc61";
    case 512:
      return "#9c0";
    case 1024:
      return "#3365a5";
    case 2048:
      return "#09c";
    case 4096:
      return "#a6b";
    case 8192:
      return "#93c";
  }
  return "black";
}

function getNumberPosition() {
  let x = position[0].length;
  let y = position.length;
  let tiles = document.querySelectorAll('.tile');
  let randomX = Math.floor(Math.random() * x);
  let randomY = Math.floor(Math.random() * y);
  if (tiles.length === 16) {
    return [6, 6];
  }
  for (let i = 0; i < tiles.length; i++) {
    let pos = tiles[i].dataset.pos.slice(0, 3);
    if (pos === randomX + ',' + randomY) {
      randomX = Math.floor(Math.random() * x);
      randomY = Math.floor(Math.random() * y);
      i = -1;
    }
  }
  return [randomX, randomY];
}

function createNum(num = 2) {
  let container = document.querySelector('.tile-container');
  let tile = document.createElement('div');
  let tile_inner = document.createElement('div');
  let pos = getNumberPosition();
  if (pos[0] > 3) {
    return false;
  }
  tile_inner.innerHTML = num.toString();
  tile_inner.style.backgroundColor = getNumberBackgroundColor(num);
  tile.className = 'tile';
  tile.style.top = position[pos[0]][pos[1]][0];
  tile.style.left = position[pos[0]][pos[1]][1];
  tile.setAttribute('data-pos', pos + ',' + num);
  tile_inner.className = 'tile-inner';
  tile.appendChild(tile_inner);
  container.appendChild(tile);
  return true;
}


function operateEvent(rank = 0, dire = 0) {
  let els = document.querySelectorAll('.tile');
  let container = document.querySelector('.tile-container');
  let posArray = [];
  let needCharge = [];
  let nowPos;
  let flag = true;
  for (let i = 0; i < els.length; i++) {
    posArray.push(els[i].dataset.pos.split(','));
  }
  for (let i = 0; i < els.length; i++) {
    nowPos = els[i].dataset.pos.split(',');
    for (let j = 0; j < posArray.length; j++) {
      if (posArray[j][rank] === nowPos[rank]) {
        needCharge.push(posArray[j]);
      }
    }
    needCharge.sort((a, b) => {
      let r = 0;
      if (rank === 0) {
        r = 1;
      }
      if (dire) {
        return b[r] - a[r];
      } else {
        return a[r] - b[r];
      }
    });
    let index = needCharge.findIndex((element, index, array) => {
      return element.toString() === nowPos.toString();
    });
    // TODO 融合操作，应该如何处理
    if (dire) {
      // 如果是down和right事件，那么需要 index++
      if (index > 0 && needCharge[index][2] === needCharge[index - 1][2]) {
        index--;
      }
      index = 3 - index;
    } else {
      // 如果是up和left事件，那么需要 index--
      if (index > 0 && needCharge[index][2] === needCharge[index - 1][2]) {
        index--;
      }
    }
    needCharge.splice(0, needCharge.length);
    let posArr = els[i].dataset.pos.split(',');
    if (!rank) {
      els[i].dataset.pos = nowPos[0] + ',' + index + ',' + posArr[posArr.length - 1];
      els[i].style.top = position[index][nowPos[0]][1];
    } else {
      els[i].dataset.pos = index + ',' + nowPos[1] + ',' + posArr[posArr.length - 1];
      els[i].style.left = position[nowPos[1]][index][0];
    }
    // 找位置相同的元素，然后删除该元素
    for (let j = 0; j < els.length; j++) {
      if (els[j].dataset.pos === els[i].dataset.pos && i !== j) {
        container.removeChild(els[j]);
        // 分数加倍
        let pos = els[i].dataset.pos.split(',');
        pos[pos.length - 1] *= 2;
        els[i].firstElementChild.innerHTML = pos[pos.length - 1];
        els[i].dataset.pos = pos.toString();
        let tileInner = els[i].firstElementChild;
        tileInner.style.backgroundColor = getNumberBackgroundColor(pos[pos.length - 1]);
        // 重新设置同一列或者同一行元素的位置
        flag = false;
      }
    }
  }
  return flag;
}

function debouce(func, delay, immediate) {
  let timer = null;
  return function () {
    let context = this;
    let args = arguments;
    if (timer) {
      clearTimeout(timer);
    }
    if (immediate) {
      let doNow = !timer;
      timer = setTimeout(() => {
        timer = null;
      }, delay);
      if (doNow) {
        func.apply(context, args);
      }
    } else {
      timer = setTimeout(() => {
        func.apply(context, args);
      }, delay);
    }
  }
}

window.onload = () => {
  // 初始化界面，生成两个元素 2
  createNum();
  createNum();
  let newGame = document.querySelector('#new-game');
  let tileContainer = document.querySelector('.tile-container');
  newGame.onclick = debouce((e) => {
    // 首先删除tile-container的所有子元素
    // 其次，随机生成两个 2 的元素方块
    tileContainer.innerHTML = '';
    createNum();
    createNum();
  }, 500, true);
  document.onkeyup = (e) => {
    let code = e.keyCode;
    let tiles = document.querySelectorAll('.tile');
    if (tiles.length === 16) {
      for (let i = 0; i < tiles.length; i++) {
        setTimeout(() => {
          tiles[i].style.transform = 'scale3d(0, 0, 0)';
        }, 180 * i);
      }
      // TODO 处理游戏结束
      setTimeout(() => {
        tileContainer.innerHTML = '';
      }, 30000);
    } else {
      let flag = false;
      switch (code) {
        case 37: {
          // left event
          while (!flag) {
            flag = operateEvent(1);
          }
          break;
        }
        case 38: {
          // top event
          while (!flag) {
            flag = operateEvent();
          }
          break;
        }
        case 39: {
          // right event
          while (!flag) {
            flag = operateEvent(1, 1);
          }
          break;
        }
        case 40: {
          // button event
          while (!flag) {
            flag = operateEvent(0, 1);
          }
          break;
        }
      }
      if ([37, 38, 39, 40].indexOf(code) !== -1) {
        setTimeout(() => {
          createNum();
        }, 400);
      }
    }
  }
};

/*
TODO 解决分数增加问题
TODO 尝试去解决3个2合成一个4的问题
TODO 利用cookie去记录best score
*/
