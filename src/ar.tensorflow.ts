/// <reference path="../node_modules/@types/jquery/index.d.ts" />

import * as tf from '@tensorflow/tfjs';
import Webcam from './webcam';
import Dataset from './dataset';

/**
 * webar by tensorflow
 * onehot softmax dense ???
 */

const CONTROLS = ['up', 'left', 'right', 'down'];
const TOTALS = [0, 0, 0, 0];
export default class ART {
    webcam: any;
    dataset: any;
    mobilenet: any;
    model: any;
    training = false;
    active = false;
    /**
     * y = 2x
     */
    testMath() {
        const trainingAnswer = tf.variable(tf.scalar(Math.random()));

        function predict(x) {
            return tf.tidy(() => {
                return trainingAnswer.mul(x)
            });
        }

        function loss(predictions, labels) {
            const meanSquareError = predictions.sub(labels).square().mean();
            return meanSquareError;
        }

        function generateData(numPoints, answer) {
            return tf.tidy(() => {
                const xs = tf.randomNormal([numPoints], -1, 1);
                const ans = tf.scalar(answer);
                const ys = ans.mul(xs);

                return {xs, ys};
            });
        }

        function train(xs, ys, numIterations) {
            const optimizer = tf.train.sgd(0.5);
        
            for (let iter = 0; iter < numIterations; iter++) {
                optimizer.minimize(() => {
                    const predsYs = predict(xs);
                    return loss(predsYs, ys);
                });
            }
        }

        async function learnCoefficients(dataCount, iterations) {
            const correctAnswer = 2; // 正確答案
            const trainingData = generateData(dataCount, 2);

            console.log('Before Training: ', await trainingAnswer.data());
            // Train the model!
            await train(trainingData.xs, trainingData.ys, iterations);
            // 印出訓練結果
            console.log('After TRaining: ', await trainingAnswer.data());
        }
        
        learnCoefficients(100, 1000);
    }

    addExamples(index) {
        this.active = false;
        this.training = true;
        $('#play').addClass('webcam-btns-disabled');        

        const label = CONTROLS[index];
        $(document.body).attr('data-active', label);
        
        tf.nextFrame().then(() => {
            if (this.training) {
                tf.tidy(() => {
                    const img = this.webcam.capture();
                    this.dataset.addExample(this.mobilenet.predict(img), index);
            
                    // Draw the preview thumbnail.
                    this.drawThumb(img, label);
                    $(`#${label}-total`).html(String(TOTALS[index]++));
                });

                this.addExamples(index);
            }
        });
    }

    drawThumb(img, label) {
        const canvas: any = $(`#${label}-thumb`).get(0);
        const ctx = canvas.getContext('2d');
        const imageData = new ImageData(224, 224);
        const data = img.dataSync();

        for (let i = 0; i < 224 * 224; ++i) {
            const j = i * 4;
            imageData.data[j + 0] = (data[i * 3 + 0] + 1) * 127;
            imageData.data[j + 1] = (data[i * 3 + 1] + 1) * 127;
            imageData.data[j + 2] = (data[i * 3 + 2] + 1) * 127;
            imageData.data[j + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
    }

    testWebcam() {
        const webcam = this.webcam = new Webcam($('#webcam').get(0));
        webcam.setup();

        this.dataset = new Dataset(4);
        tf.loadModel('./model/webcam.json').then(model => {
            const layer = model.getLayer('conv_pw_13_relu');
            this.mobilenet = tf.model({inputs: model.inputs, outputs: layer.output});
            // Warm up the model
            tf.tidy(() => this.mobilenet.predict(webcam.capture()));
        });

        $('#up').on('mousedown', () => {
            this.addExamples(0);
        });

        $('#left').on('mousedown', () => {
            this.addExamples(1);
        });

        $('#right').on('mousedown', () => {
            this.addExamples(2);
        });

        $('#down').on('mousedown', () => {
            this.addExamples(3);
        });

        $('#up,#left,#right,#down').on('mouseup', () => {
            $(document.body).attr('data-active', '');
            this.training = false;
        });

        $('#train').on('click', () => this.train());
        $('#play').on('click', () => this.predict());
    }

    /**
     * s训练我们自己的模型数据
     */
    train() {
        this.active = false;
        $('#play').addClass('webcam-btns-disabled');
        
        if (this.dataset.xs == null) {
            return alert('先在右侧面板进行图像采集!');
        }
        
        const dataset = this.dataset;
        // Creates a 2-layer fully connected model. By creating a separate model,
        // rather than adding layers to the mobilenet model, we "freeze" the weights
        // of the mobilenet model, and only train weights from the new model.
        this.model = tf.sequential({
            layers: [
                // Flattens the input to a vector so we can use it in a dense layer. While
                // technically a layer, this only performs a reshape (and has no training
                // parameters).
                tf.layers.flatten({inputShape: [7, 7, 256]}),
                // Layer 1
                tf.layers.dense({
                    // 神经单元节点数
                    units: 100,
                    activation: 'relu',
                    kernelInitializer: 'varianceScaling',
                    useBias: true
                }),
                // Layer 2. 神经节点数和我们要预测的类别数相同
                tf.layers.dense({
                    units: 4,
                    kernelInitializer: 'varianceScaling',
                    useBias: false,
                    // 概率总和为 1.0
                    activation: 'softmax'
                })
            ]
        });
    
        // 创建 adam 优化器
        const optimizer = tf.train.adam(0.01);
        // 损失函数将测量我们4个类别的预测概率分布与真实标签之间的误差
        this.model.compile({optimizer: optimizer, loss: 'categoricalCrossentropy'});
        // 每次迭代取多少样本进行训练
        const batchSize = Math.floor(dataset.xs.shape[0] * 0.4);
        if (!(batchSize > 0)) {
            throw new Error('Batch size is 0 or NaN. Please choose a non-zero fraction.');
        }
    
        // Train the model! Model.fit() will shuffle xs & ys so we don't have to.
        this.model.fit(dataset.xs, dataset.ys, {
            batchSize,
            epochs: 20,
            callbacks: {
                onBatchEnd: async (batch, logs) => {
                    $('header').html('Loss: ' + logs.loss.toFixed(5));
                    await tf.nextFrame();
                }
            }
        }).then(() => {
            this.active = true;
            $('#play').removeClass('webcam-btns-disabled');
        });
    }

    predict() {
        if (!this.active) {
            return;
        }

        const predictedClass = tf.tidy(() => {
            const img = this.webcam.capture();
            // first use mobilenet
            const activation = this.mobilenet.predict(img);
            // our model
            const predictions = this.model.predict(activation);
            // 获取结果中最大值的索引号 [1, 0, 0, 0] [0, 0, 1, 0] ...
            return predictions.as1D().argMax();
        });

        predictedClass.data().then(classId => this.moveTarget(classId[0]));
        // loop
        tf.nextFrame().then(() => this.predict());
    }

    moveTarget(index) {
        const label = CONTROLS[index];
        const $elem = $('#target');
        const y = parseInt($elem.css('top'));
        const x = parseInt($elem.css('left'));
console.log(index)
        $(document.body).attr('data-active', label);

        switch (index) {
            case 0:
                if (y <= 0) {
                    $elem.css('top', '2px');
                } else {
                    $elem.css('top', y - 1 + 'px');
                }
                break;
            case 1:
                if (x <= 0) {
                    $elem.css('left', '2px');
                } else {
                    $elem.css('left', x - 1 + 'px');
                }
                break;
            case 2:
                if (x >= window.innerWidth - 30) {
                    $elem.css('left', window.innerWidth - 32 + 'px');
                } else {
                    $elem.css('left', x + 1 + 'px');
                }
                break;
            case 3:
                if (y >= 170) {
                    $elem.css('top', '168px');
                } else {
                    $elem.css('top', y + 1 + 'px');
                }
                break;
        }
    }
}
