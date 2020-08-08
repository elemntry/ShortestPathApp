using System;
using System.Collections.Generic;
using System.Text;

namespace ShortestPathAlgos
{
    public class Dijkstra
    {
        private PriorityQueue<Node> h = new PriorityQueue<Node>();
        public int[] Dist { get; private set; }
        public bool[] VisitedNodes { get; private set; }
        public Node[] Prev { get; private set; }
        public Graph Graph { get; private set; }
        public Node S { get; private set; }

        public Dijkstra(Graph graph, Node s) //на вход искомый граф и узел из которого начнется поиск кр. путей
        {
            Graph = graph; //граф для поиска пути
            S = s; //узел из которого начнется поиск
            InitialiseSingleSource(Graph, S);
        }

        private void InitialiseSingleSource(Graph graph, Node s) // инициализация
        {
            //инициализируем массив расстояний от вершины S до искомого узла. Изначально ставим каждому узлу, условно, "+ бесконечность"
            //устанавливаем значение расстояния вершины из которой пойдет поиск = 0 (S = 0)
            Dist = new int[graph.Nodes.Count];
            VisitedNodes = new bool[graph.Nodes.Count]; // ведем реестр посещенных узлов
            for (int i = 0; i < Dist.Length; i++)
            {
                Dist[i] = int.MaxValue;
            }

            //устанавливаем начальное расстояние из которого пойдет поиск
            Dist[graph.Nodes.IndexOf(s)] = 0;
            // инициализируем массив из узлов предидущих на кратчайшем пути
            Prev = new Node[graph.Nodes.Count];
        }

        private void Relax(Node u, Node v, int weight) // релаксация
        {
            // если известный вес от исходной вершины до текущей больше чем исследуемый
            if (Dist[Graph.Nodes.IndexOf(v)] > Dist[Graph.Nodes.IndexOf(u)] + weight)
            {
                // заменяем известный вес исследуемым.
                Dist[Graph.Nodes.IndexOf(v)] = Dist[Graph.Nodes.IndexOf(u)] + weight;
                // устанавливаем пред вершину с мин дист. В эл. массива Prev с номером ислледуемой вершины кладем ссылку на предидущюю вершину
                Prev[Graph.Nodes.IndexOf(v)] = u;
            }
        }

        public void FindShortestPath() // поиск мин пути до каждой вершины
        {
            //Создаем очередь с приоритетом добавляем первый узел с которого идет поиск
            // //(узел с которого начинаем поиск ранее установлен и путь до него равен 0, остальные в int.MaxValue(~ +infinity))
            h.Enqueue(S, Dist[Graph.Nodes.IndexOf(S)]);

            //пока очередь не пуста достаем минимальный элемент из очереди и для каждого элемента находим смежные узлы
            //затем релаксируем их, т.е. проверяем наименьшие веса, если вес меньше изменяем путь до этого ула на наименьший.
            while (h.Count > 0)
            {
                var u = h.Dequeue();
                VisitedNodes[Graph.Nodes.IndexOf(u)] = true; // помечаем вершину как посещеную
                //TODO: определить ориентированный или нет граф
                //если граф ориентированный - берем только исходящие ребра
                //если граф неориентированный - создаем словарь с входящими и исходящими ребрами
                //var directed = true;
                //var edgesInboundAndOutbounds = new Dictionary<int, Edge>();
                //Graph.Nodes[Graph.Nodes.IndexOf(u)].OutboundEdges.ForEach(edge => edgesInboundAndOutbounds.Add(edge.,edge));
                //var edgesInNode = directed ? Graph.Nodes[Graph.Nodes.IndexOf(u)].OutboundEdges : 
                foreach (var edge in Graph.Nodes[Graph.Nodes.IndexOf(u)].OutboundEdges)
                {
                    Relax(u, edge.To, edge.Weight);
                    if (VisitedNodes[Graph.Nodes.IndexOf(edge.To)] == false)// Проверяем, посещена ли вершина, если нет, то добавляем в очередь на релаксацию
                        h.Enqueue(edge.To, edge.Weight);
                }
            }
        }
    }
}
