import * as tf from '@tensorflow/tfjs';

/**
 * @file dataset 收集采样数据
 */

export default class Dataset {
    numClasses: any;
    xs: any;
    ys: any;

    constructor(numClasses) {
        this.numClasses = numClasses;
    }

    /**
     * Adds an example to the controller dataset.
     * @param {Tensor} example 摄像机的一帧
     * @param {number} label 结果编号
     */
    addExample(example, label) {
        // 将标签转化 one-hot 向量作为结果
        const y = tf.tidy(() => tf.oneHot(tf.tensor1d([label]), this.numClasses));
console.log(example);
        if (this.xs == null) {
            // keep tensors
            this.xs = tf.keep(example);
            this.ys = tf.keep(y);
        } else {
            const oldX = this.xs;
            this.xs = tf.keep(oldX.concat(example, 0));

            const oldY = this.ys;
            this.ys = tf.keep(oldY.concat(y, 0));

            oldX.dispose();
            oldY.dispose();
            y.dispose();
        }
    }
}