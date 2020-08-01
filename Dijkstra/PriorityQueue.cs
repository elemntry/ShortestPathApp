using System;
using System.Collections.Generic;
using System.Text;

namespace Dijkstra
{
    class PriorityQueue<T>
    {
        // В этом примере я использую несортированный массив, но в идеале
        // это должна быть двоичная куча.
        // можно использовать класс двоичной кучи:
        // * https://github.com/BlueRaja/High-Speed-Priority-Queue-for-C-Sharp
        // * http://visualstudiomagazine.com/articles/2012/11/01/priority-queues-with-c.aspx
        // * http://xfleury.github.io/graphsearch.html
        // * http://stackoverflow.com/questions/102398/priority-queue-in-net

        private List<Tuple<T, int>> elements = new List<Tuple<T, int>>();

        public int Count => elements.Count;

        public void Enqueue(T item, int priority)
        {
            elements.Add(Tuple.Create(item, priority));
        }

        public T Dequeue()
        {
            int bestIndex = 0;

            for (int i = 0; i < elements.Count; i++)
            {
                if (elements[i].Item2 < elements[bestIndex].Item2)
                {
                    bestIndex = i;
                }
            }

            T bestItem = elements[bestIndex].Item1;
            elements.RemoveAt(bestIndex);
            return bestItem;
        }
    }
}
