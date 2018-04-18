import * as tf from '@tensorflow/tfjs';

/**
 * webar by tensorflow
 */

export default class Work {
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

    testWebcam() {

    }
}
